import jwt from "jsonwebtoken";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import env from "../../Config/env.js";
import UserMd from "../User/UserMd.js";
import OtpMd from "../Otp/OtpMd.js";
import { requestLimoOtp, verifyLimoOtp } from "../../Utils/limoOtpService.js";

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

  if (!user) {
    throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");
  }

  // محدودیت ارسال مجدد
  const last = await OtpMd.findOne({
    phone,
    purpose: OTP_PURPOSE,
  })
    .sort({ createdAt: -1 })
    .select("createdAt");

  if (last) {
    const elapsed = Date.now() - last.createdAt.getTime();

    if (elapsed < OTP_COOLDOWN_MS) {
      const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);

      throw new ApiError(429, `برای دریافت کد جدید ${wait.toLocaleString("fa-IR")} ثانیه صبر کنید`);
    }
  }

  // ارسال OTP توسط LimoSMS
  await requestLimoOtp(phone);

  // ذخیره فقط اطلاعات مدیریت درخواست؛ نه OTP واقعی
  await OtpMd.create({
    phone,
    code: "LIMO_SMS",
    purpose: OTP_PURPOSE,
    expiresAt: new Date(Date.now() + env.OTP_EXPIRE_MINUTES * 60 * 1000),
    attempts: 0,
    isUsed: false,
  });

  new ApiResponse(
    200,
    {
      expiresInMinutes: env.OTP_EXPIRE_MINUTES,
    },
    "کد تایید ارسال شد"
  ).send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  if (!phone || !code || !newPassword) {
    throw ApiError.badRequest("شماره موبایل، کد تایید و رمز جدید الزامی هستند");
  }

  const latest = await OtpMd.findOne({
    phone,
    purpose: OTP_PURPOSE,
    isUsed: false,
  })
    .sort({ createdAt: -1 })
    .select("_id");

  if (!latest) {
    throw ApiError.badRequest("کد تاییدی برای این شماره یافت نشد");
  }

  // ثبت تلاش
  const otp = await OtpMd.findOneAndUpdate(
    {
      _id: latest._id,
      isUsed: false,
    },
    {
      $inc: { attempts: 1 },
    },
    {
      returnDocument: "after",
    }
  );

  if (!otp) {
    throw ApiError.badRequest("این درخواست قبلاً استفاده شده است");
  }

  if (otp.expiresAt < new Date()) {
    throw ApiError.badRequest("کد تایید منقضی شده است");
  }

  if (otp.attempts > OTP_MAX_ATTEMPTS) {
    throw ApiError.badRequest("تعداد تلاش‌های ناموفق بیش از حد مجاز است؛ کد جدید دریافت کنید");
  }

  // بررسی OTP توسط LimoSMS
  const isValid = await verifyLimoOtp(phone, code);

  if (!isValid) {
    throw ApiError.badRequest("کد تایید نادرست است");
  }

  // مصرف درخواست
  const consumed = await OtpMd.findOneAndUpdate(
    {
      _id: otp._id,
      isUsed: false,
    },
    {
      isUsed: true,
    }
  );

  if (!consumed) {
    throw ApiError.badRequest("این کد قبلاً استفاده شده است");
  }

  // بی‌اعتبار کردن درخواست‌های قبلی
  await OtpMd.updateMany(
    {
      phone,
      purpose: OTP_PURPOSE,
    },
    {
      isUsed: true,
    }
  );

  const user = await UserMd.findOne({
    phone,
  }).select("+password");

  if (!user) {
    throw ApiError.notFound("کاربری با این شماره موبایل یافت نشد");
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id, user.role);

  new ApiResponse(200, { token }, "رمز عبور با موفقیت تغییر کرد").send(res);
});
