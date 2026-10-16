import { z } from "zod";
import { addressSchema } from "../User/UserVl.js";

export const createOrderSchema = z.object({
  address: addressSchema,
  couponCode: z.string().optional(),
});

export const updateStatusSchema = z
  .object({
    status: z.enum(["processing", "shipped", "delivered", "canceled"]).optional(),
    trackingCode: z.string().trim().min(3, "کد رهگیری معتبر نیست").max(60).optional(),
  })
  .refine((data) => data.status || data.trackingCode, {
    message: "وضعیت یا کد رهگیری الزامی است",
  });
