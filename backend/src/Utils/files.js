import fs from "fs/promises";
import path from "path";
import { uploadFolders } from "../Config/multer.js";
import { escapeRegex } from "./text.js";
import ProductMd from "../Modules/Product/ProductMd.js";
import CategoryMd from "../Modules/Category/CategoryMd.js";
import OrderMd from "../Modules/Order/OrderMd.js";

const FOLDER_BY_PREFIX = {
  "/uploads/products/": uploadFolders.products,
  "/uploads/categories/": uploadFolders.categories,
};

// آیا هنوز جایی (محصول، دسته‌بندی، اسنپ‌شات سفارش) به این تصویر ارجاع هست؟
async function isStillUsed(prefix, filename) {
  const regex = new RegExp(`${escapeRegex(prefix)}${escapeRegex(filename)}$`);

  const [inProduct, inCategory, inOrder] = await Promise.all([
    ProductMd.exists({ images: regex }),
    CategoryMd.exists({ image: regex }),
    OrderMd.exists({ "items.image": regex }),
  ]);

  return Boolean(inProduct || inCategory || inOrder);
}

// فقط فایل‌هایی که خودمون آپلود کرده‌ایم و دیگه به هیچ‌جا ارجاع ندارن حذف میشن
export async function removeUploadedFiles(urls = []) {
  for (const url of urls) {
    if (!url) continue;

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
    } catch {
      continue;
    }

    const prefix = Object.keys(FOLDER_BY_PREFIX).find((p) => pathname.startsWith(p));
    if (!prefix) continue; // آدرس خارجی

    const filename = path.basename(pathname); // جلوگیری از path traversal
    if (await isStillUsed(prefix, filename)) continue;

    try {
      await fs.unlink(path.join(FOLDER_BY_PREFIX[prefix], filename));
    } catch {
      // فایل قبلاً حذف شده
    }
  }
}

// پاکسازی تصاویر آپلودشده‌ای که هیچ ارجاعی ندارن (مثلاً فرمی که بدون ذخیره بسته شده)
export async function sweepOrphanUploads(minAgeMs = 24 * 60 * 60 * 1000) {
  const [productImages, categoryImages, orderImages] = await Promise.all([
    ProductMd.distinct("images"),
    CategoryMd.distinct("image"),
    OrderMd.distinct("items.image"),
  ]);

  const referenced = new Set(
    [...productImages, ...categoryImages, ...orderImages]
      .filter(Boolean)
      .map((url) => path.basename(String(url).split("?")[0]))
  );

  let removed = 0;

  for (const folder of Object.values(uploadFolders)) {
    let files;
    try {
      files = await fs.readdir(folder);
    } catch {
      continue;
    }

    for (const file of files) {
      if (referenced.has(file)) continue;

      const filePath = path.join(folder, file);
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile() || Date.now() - stat.mtimeMs < minAgeMs) continue; // فایل تازه‌آپلودشده دست نمی‌خوره
        await fs.unlink(filePath);
        removed += 1;
      } catch {
        // نادیده گرفته میشه
      }
    }
  }

  return removed;
}
