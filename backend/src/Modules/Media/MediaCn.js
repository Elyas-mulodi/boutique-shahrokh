import sharp from "sharp";
import path from "path";
import fs from "fs";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { uploadDir } from "../../Config/multer.js";

export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest("هیچ تصویری ارسال نشده است");
  }

  const savedFiles = [];

  for (const file of req.files) {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const filePath = path.join(uploadDir, filename);

    await sharp(file.buffer)
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);

    savedFiles.push(`/uploads/products/${filename}`);
  }

  new ApiResponse(201, { urls: savedFiles }, "تصاویر با موفقیت آپلود شدند").send(res);
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) throw ApiError.notFound("فایل یافت نشد");

  fs.unlinkSync(filePath);
  new ApiResponse(200, null, "تصویر حذف شد").send(res);
});