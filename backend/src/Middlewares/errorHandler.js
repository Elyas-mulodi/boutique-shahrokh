import env from "../Config/env.js";
import ApiError from "../Utils/ApiError.js";
import logger from "../Config/logger.js";

export function notFound(req, res, next) {
  next(ApiError.notFound(`مسیر ${req.originalUrl} یافت نشد`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let { statusCode, message, errors } = err;

  if (err.name === "CastError") {
    statusCode = 400;
    message = "شناسه ارسالی معتبر نیست";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `مقدار وارد شده برای ${field} تکراری است`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") message = "حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد";
    else if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "تعداد تصاویر ارسالی بیش از حد مجاز است";
    } else message = "خطا در آپلود فایل";
  }

  if (err.message?.includes("فرمت")) statusCode = statusCode || 400;
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "ساختار اطلاعات ارسالی نامعتبر است";
  }
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "حجم اطلاعات ارسالی بیش از حد مجاز است";
  }

  statusCode = statusCode || 500;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${err.message}`);
    if (env.NODE_ENV === "production") message = "خطای داخلی سرور";
  }

  res.status(statusCode).json({
    success: false,
    message: message || "خطای داخلی سرور",
    errors: errors || undefined,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
}