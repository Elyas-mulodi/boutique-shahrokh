import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "شناسه نامعتبر است");

const baseCategory = z.object({
  name: z
    .string({ required_error: "نام دسته‌بندی الزامی است" })
    .trim()
    .min(2, "نام دسته‌بندی معتبر نیست")
    .max(60, "نام دسته‌بندی بیش از حد طولانی است"),
  slug: z
    .string({ required_error: "آدرس (slug) الزامی است" })
    .trim()
    .min(2, "آدرس (slug) معتبر نیست")
    .max(80, "آدرس (slug) بیش از حد طولانی است")
    .regex(/^[^\s/?#%\\]+$/, "آدرس نباید فاصله یا کاراکترهای / ? # % داشته باشد"),
  parent: objectId.nullable().optional(),
  image: z
    .string()
    .trim()
    .min(1, "آدرس تصویر معتبر نیست")
    .max(500, "آدرس تصویر بیش از حد طولانی است")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = baseCategory;
export const updateCategorySchema = baseCategory.partial();

export const moveCategorySchema = z.object({
  direction: z.enum(["up", "down"], { errorMap: () => ({ message: "جهت جابه‌جایی نامعتبر است" }) }),
});
