import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import * as UserSr from "./UserSr.js";
import UserMd from "./UserMd.js";
import ApiError from "../../Utils/ApiError.js";

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await UserMd.findById(req.user._id).select("+password");
  if (!user) throw ApiError.notFound("کاربر یافت نشد");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest("رمز عبور فعلی نادرست است");

  if (currentPassword === newPassword) {
    throw ApiError.badRequest("رمز عبور جدید باید با رمز فعلی متفاوت باشد");
  }

  user.password = newPassword; // هش‌شدن تو pre-save مدل انجام میشه
  await user.save();

  new ApiResponse(200, null, "رمز عبور با موفقیت تغییر کرد").send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user.toSafeObject(), "پروفایل کاربر").send(res);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await UserSr.updateProfile(req.user._id, req.body);
  new ApiResponse(200, user.toSafeObject(), "پروفایل بروزرسانی شد").send(res);
});

export const setAddress = asyncHandler(async (req, res) => {
  const user = await UserSr.setDefaultAddress(req.user._id, req.body);
  new ApiResponse(200, user.defaultAddress, "آدرس ذخیره شد").send(res);
});

// ادمین
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await UserSr.listUsers({ page: Number(page) || 1, limit: Number(limit) || 20 });
  new ApiResponse(200, result, "لیست کاربران").send(res);
});

export const toggleBlock = asyncHandler(async (req, res) => {
  const user = await UserSr.toggleBlock(req.params.id);
  new ApiResponse(200, user.toSafeObject(), "وضعیت کاربر تغییر کرد").send(res);
});
