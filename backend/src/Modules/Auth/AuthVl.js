import { z } from "zod";
import { phoneField } from "../User/UserVl.js";

const passwordField = z.string({ required_error: "رمز عبور الزامی است" }).min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد");

export const registerSchema = z.object({
  name: z.string().min(3, "نام باید حداقل ۳ کاراکتر باشد"),
  phone: phoneField,
  password: passwordField,
});

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string({ required_error: "رمز عبور الزامی است" }),
});

export const requestOtpSchema = z.object({ phone: phoneField });

export const resetPasswordSchema = z.object({
  phone: phoneField,
  code: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
  newPassword: passwordField,
});