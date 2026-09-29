import jwt from "jsonwebtoken";
import env from "../Config/env.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "../Utils/asyncHandler.js";
import UserMd from "../Modules/User/UserMd.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("توکن ارسال نشده است");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized("توکن نامعتبر یا منقضی شده است");
  }

  const user = await UserMd.findById(decoded.id).select("-password");
  if (!user) throw ApiError.unauthorized("کاربر مربوط به این توکن یافت نشد");
  if (user.isBlocked) throw ApiError.forbidden("حساب کاربری شما مسدود شده است");

  req.user = user;
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("شما اجازه دسترسی به این بخش را ندارید"));
    }
    next();
  };