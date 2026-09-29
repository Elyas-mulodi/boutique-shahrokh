import { z } from "zod";

const variantSchema = z.object({
  size: z.string({ required_error: "سایز الزامی است" }),
  color: z.string({ required_error: "رنگ الزامی است" }),
  stock: z.number({ required_error: "موجودی الزامی است" }).min(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "نام محصول معتبر نیست"),
  slug: z.string().min(2, "slug معتبر نیست"),
  description: z.string().optional(),
  price: z.number({ required_error: "قیمت الزامی است" }).min(0),
  category: z.string({ required_error: "دسته‌بندی الزامی است" }),
  images: z.array(z.string()).optional(),
  variants: z.array(variantSchema).min(1, "حداقل یک ترکیب سایز/رنگ الزامی است"),
});

export const updateProductSchema = createProductSchema.partial();