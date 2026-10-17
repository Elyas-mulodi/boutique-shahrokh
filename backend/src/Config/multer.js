import fs from "fs";
import multer from "multer";
import ApiError from "../Utils/ApiError.js";

export const uploadsRoot = "uploads";
export const uploadFolders = {
  products: `${uploadsRoot}/products`,
  categories: `${uploadsRoot}/categories`,
};

Object.values(uploadFolders).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(), // فایل خام میاد تو حافظه، بعد با sharp پردازش و ذخیره میشه
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest("فقط فرمت‌های jpg، png و webp مجاز است"));
    }
    return cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export default upload;