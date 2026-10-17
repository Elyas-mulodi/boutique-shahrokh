import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import env from "../../Config/env.js";
import { uploadFolders } from "../../Config/multer.js";
import { removeUploadedFiles } from "../../Utils/files.js";

async function saveImages(files, kind) {
  const urls = [];

  try {
    for (const file of files) {
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;

      await sharp(file.buffer)
        .rotate()
        .resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(uploadFolders[kind], filename));

      urls.push(`${env.PUBLIC_URL}/uploads/${kind}/${filename}`);
    }
  } catch {
    await removeUploadedFiles(urls); // اگه یکی خراب بود، بقیه هم پاک بشن
    throw ApiError.badRequest("یکی از تصاویر معتبر نیست یا پردازش نشد");
  }

  return urls;
}

export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest("هیچ تصویری ارسال نشده است");

  const urls = await saveImages(req.files, "products");
  new ApiResponse(201, { urls }, "تصاویر آپلود شدند").send(res);
});

export const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("تصویری ارسال نشده است");

  const [url] = await saveImages([req.file], "categories");
  new ApiResponse(201, { url }, "تصویر آپلود شد").send(res);
});