import { z } from "zod";

const iranPhoneRegex = /^09\d{9}$/;

export const phoneField = z
  .string({ required_error: "شماره موبایل الزامی است" })
  .regex(iranPhoneRegex, "شماره موبایل معتبر نیست");

export const addressSchema = z.object({
  province: z.string({ required_error: "استان الزامی است" }),
  city: z.string({ required_error: "شهر الزامی است" }),
  fullAddress: z.string().min(10, "آدرس کامل را وارد کنید"),
  postalCode: z.string().length(10, "کد پستی باید ۱۰ رقم باشد"),
  receiverName: z.string({ required_error: "نام گیرنده الزامی است" }),
  receiverPhone: phoneField,
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "نام خانوادگی معتبر نیست").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "رمز عبور فعلی الزامی است" })
    .min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z
    .string({ required_error: "رمز عبور جدید الزامی است" })
    .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
});