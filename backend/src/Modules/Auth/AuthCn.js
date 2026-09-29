import jwt from "jsonwebtoken";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import env from "../../Config/env.js";
import UserMd from "../User/UserMd.js";
import OtpMd from "../Otp/OtpMd.js";

function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendSms(phone, message) {
  console.log(`📱 [SMS to ${phone}]: ${message}`); // TODO: اتصال به کاوه‌نگار/فراپیامک
}

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  const existing = await UserMd.findOne({ phone });
  if (existing)
    throw ApiError.conflict("این شماره موبایل قبلا ثبت‌نام کرده است");

  const user = await UserMd.create({ name, phone, password });
  const token = generateToken(user._id, user.role);

  new ApiResponse(
    201,
    { user: user.toSafeObject(), token },
    "ثبت‌نام موفق",
  ).send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await UserMd.findOne({ phone }).select("+password");
  if (!user) throw ApiError.unauthorized("شماره موبایل یا رمز عبور اشتباه است");
  if (user.isBlocked) throw ApiError.forbidden("حساب کاربری شما مسدود شده است");

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    throw ApiError.unauthorized("شماره موبایل یا رمز عبور اشتباه است");

  const token = generateToken(user._id, user.role);
  new ApiResponse(200, { user: user.toSafeObject(), token }, "ورود موفق").send(
    res,
  );
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await UserMd.findOne({ phone });
  if (!user) throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");

  const code = generateCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRE_MINUTES * 60 * 1000);

  await OtpMd.create({ phone, code, purpose: "forgot_password", expiresAt });
  await sendSms(phone, `کد تایید بوتیک شاهرخ: ${code}`);

  new ApiResponse(
    200,
    { expiresInMinutes: env.OTP_EXPIRE_MINUTES },
    "کد تایید ارسال شد",
  ).send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  const otp = await OtpMd.findOne({
    phone,
    purpose: "forgot_password",
    isUsed: false,
  }).sort({ createdAt: -1 });
  if (!otp) throw ApiError.badRequest("کد تاییدی برای این شماره یافت نشد");
  if (otp.expiresAt < new Date())
    throw ApiError.badRequest("کد تایید منقضی شده است");
  if (otp.code !== code) throw ApiError.badRequest("کد تایید نادرست است");

  otp.isUsed = true;
  await otp.save();

  const user = await UserMd.findOne({ phone }).select("+password");
  if (!user) throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id, user.role);
  new ApiResponse(200, { token }, "رمز عبور با موفقیت تغییر کرد").send(res);
});
