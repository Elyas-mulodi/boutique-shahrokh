import env from "../Config/env.js";

export function notFound(req, res, next) {
  next({ statusCode: 404, message: `مسیر ${req.originalUrl} یافت نشد` });
}

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

  statusCode = statusCode || 500;
  message = message || "خطای داخلی سرور";

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
}