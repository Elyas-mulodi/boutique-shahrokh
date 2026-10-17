import fs from "fs/promises";
import path from "path";
import { uploadFolders } from "../Config/multer.js";

const FOLDER_BY_PREFIX = {
  "/uploads/products/": uploadFolders.products,
  "/uploads/categories/": uploadFolders.categories,
};

// فقط فایل‌هایی که خودمون آپلود کرده‌ایم حذف میشن؛ آدرس‌های خارجی نادیده گرفته میشن
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
    if (!prefix) continue;

    const filename = path.basename(pathname); // جلوگیری از path traversal
    try {
      await fs.unlink(path.join(FOLDER_BY_PREFIX[prefix], filename));
    } catch {
      // فایل قبلاً حذف شده
    }
  }
}