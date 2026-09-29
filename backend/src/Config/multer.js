import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/products";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage(); // فایل خام میاد تو حافظه، بعد با sharp پردازش و ذخیره میشه

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("فقط فرمت‌های jpg, png, webp مجاز است"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 6 }, // حداکثر ۵ مگابایت، ۶ عکس همزمان
});

export default upload;
export { uploadDir };