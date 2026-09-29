import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی معتبر نیست"),
  slug: z.string().min(2, "slug معتبر نیست"),
  parent: z.string().nullable().optional(), // ObjectId والد، یا null برای دسته ریشه
  image: z.string().url().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();