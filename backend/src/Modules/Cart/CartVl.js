import { z } from "zod";

export const addItemSchema = z.object({
  product: z.string({ required_error: "شناسه محصول الزامی است" }),
  variantId: z.string({ required_error: "شناسه تنوع (سایز/رنگ) الزامی است" }),
  quantity: z.number({ required_error: "تعداد الزامی است" }).min(1),
});

export const updateItemSchema = z.object({
  quantity: z.number({ required_error: "تعداد الزامی است" }).min(1),
});