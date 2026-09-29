import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3, "کد تخفیف معتبر نیست"),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  expiresAt: z.string().datetime({ message: "تاریخ انقضا معتبر نیست" }),
});

export const applyCouponSchema = z.object({
  code: z.string().min(3, "کد تخفیف معتبر نیست"),
});