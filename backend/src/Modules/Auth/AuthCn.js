import crypto from "crypto";
import jwt from "jsonwebtoken";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { sendOtpSms } from "../../Utils/sms.js";
import env from "../../Config/env.js";
import UserMd from "../User/UserMd.js";
import OtpMd from "../Otp/OtpMd.js";

const OTP_PURPOSE = "forgot_password";
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export const register = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  const existing = await UserMd.findOne({ phone });
  if (existing) throw ApiError.conflict("این شماره موبایل قبلا ثبت‌نام کرده است");

  const user = await UserMd.create({ name, phone, password });
  const token = generateToken(user._id, user.role);

  new ApiResponse(201, { user: user.toSafeObject(), token }, "ثبت‌نام موفق").send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await UserMd.findOne({ phone }).select("+password");
  if (!user) throw ApiError.unauthorized("شماره موبایل یا رمز عبور اشتباه است");
  if (user.isBlocked) throw ApiError.forbidden("حساب کاربری شما مسدود شده است");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("شماره موبایل یا رمز عبور اشتباه است");

  const token = generateToken(user._id, user.role);
  new ApiResponse(200, { user: user.toSafeObject(), token }, "ورود موفق").send(res);
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await UserMd.findOne({ phone });
  if (!user) throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");

  // فاصله‌ی حداقلی بین دو درخواست برای یک شماره (جلوگیری از اسپم پیامک)
  const last = await OtpMd.findOne({ phone, purpose: OTP_PURPOSE })
    .sort({ createdAt: -1 })
    .select("createdAt");
  if (last) {
    const elapsed = Date.now() - last.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      throw new ApiError(429, `برای دریافت کد جدید ${wait.toLocaleString("fa-IR")} ثانیه صبر کنید`);
    }
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRE_MINUTES * 60 * 1000);

  const otp = await OtpMd.create({ phone, code, purpose: OTP_PURPOSE, expiresAt });

  try {
    await sendOtpSms(phone, code);
  } catch (err) {
    await OtpMd.deleteOne({ _id: otp._id });
    throw err;
  }

  new ApiResponse(200, { expiresInMinutes: env.OTP_EXPIRE_MINUTES }, "کد تایید ارسال شد").send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  const latest = await OtpMd.findOne({ phone, purpose: OTP_PURPOSE, isUsed: false })
    .sort({ createdAt: -1 })
    .select("_id");
  if (!latest) throw ApiError.badRequest("کد تاییدی برای این شماره یافت نشد");

  // هر حدس قبل از مقایسه ثبت میشه؛ حداکثر ۵ تلاش برای هر کد
  const otp = await OtpMd.findOneAndUpdate(
    { _id: latest._id, isUsed: false },
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (!otp) throw ApiError.badRequest("این کد قبلاً استفاده شده است");

  if (otp.expiresAt < new Date()) throw ApiError.badRequest("کد تایید منقضی شده است");
  if (otp.attempts > OTP_MAX_ATTEMPTS) {
    throw ApiError.badRequest("تعداد تلاش‌های ناموفق بیش از حد مجاز است؛ کد جدید دریافت کنید");
  }

  const expected = Buffer.from(otp.code);
  const given = Buffer.from(String(code));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    throw ApiError.badRequest("کد تایید نادرست است");
  }

  // مصرف اتمیک: اگه همزمان دو درخواست رسید، فقط یکی موفق میشه
  const consumed = await OtpMd.findOneAndUpdate({ _id: otp._id, isUsed: false }, { isUsed: true });
  if (!consumed) throw ApiError.badRequest("این کد قبلاً استفاده شده است");
  await OtpMd.updateMany({ phone, purpose: OTP_PURPOSE }, { isUsed: true });

  const user = await UserMd.findOne({ phone }).select("+password");
  if (!user) throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");

  user.password = newPassword; // هش‌شدن تو pre-save مدل انجام میشه
  await user.save();

  const token = generateToken(user._id, user.role);
  new ApiResponse(200, { token }, "رمز عبور با موفقیت تغییر کرد").send(res);
});
