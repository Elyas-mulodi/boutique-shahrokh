import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "شناسه نامعتبر است");
const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "کد رنگ معتبر نیست");

const stock = z
  .number({ required_error: "موجودی الزامی است", invalid_type_error: "موجودی باید عدد باشد" })
  .int("موجودی باید عدد صحیح باشد")
  .min(0, "موجودی نمی‌تواند منفی باشد")
  .max(1000000, "موجودی بیش از حد مجاز است");

const variantFields = {
  _id: objectId.optional(), // شناسه‌ی تنوع‌های موجود؛ برای حفظ ارجاع سبدها
  size: z.string({ required_error: "سایز الزامی است" }).trim().min(1, "سایز الزامی است").max(20, "سایز بیش از حد طولانی است"),
  color: z.string({ required_error: "رنگ الزامی است" }).trim().min(1, "رنگ الزامی است").max(30, "نام رنگ بیش از حد طولانی است"),
  colorHex: hexColor.nullable().optional(),
};

// تنوع جدید: موجودی الزامی است
const createVariantSchema = z.object({ ...variantFields, stock });
// ویرایش: موجودی تنوع‌های دست‌نخورده فرستاده نمیشه (مقدار فعلی دیتابیس حفظ میشه)
const updateVariantSchema = z.object({ ...variantFields, stock: stock.optional() });

const noDuplicateVariants = (variants, ctx) => {
  const seen = new Set();
  variants.forEach((v, index) => {
    const key = `${v.size.toLowerCase()}|${v.color.toLowerCase()}`;
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ترکیب سایز و رنگ تکراری است",
        path: [index, "size"],
      });
    }
    seen.add(key);
  });
};

const buildProductSchema = (variantSchema) =>
  z.object({
    name: z.string({ required_error: "نام محصول الزامی است" }).trim().min(2, "نام محصول معتبر نیست").max(150, "نام محصول بیش از حد طولانی است"),
    slug: z
      .string({ required_error: "آدرس (slug) الزامی است" })
      .trim()
      .min(2, "آدرس (slug) معتبر نیست")
      .max(150, "آدرس (slug) بیش از حد طولانی است")
      .regex(/^[^\s/?#%\\]+$/, "آدرس نباید فاصله یا کاراکترهای / ? # % داشته باشد"),
    description: z.string().max(5000, "توضیحات بیش از حد طولانی است").optional(),
    price: z
      .number({ required_error: "قیمت الزامی است", invalid_type_error: "قیمت باید عدد باشد" })
      .int("قیمت باید عدد صحیح باشد")
      .min(0, "قیمت نمی‌تواند منفی باشد")
      .max(10000000000, "قیمت بیش از حد مجاز است"),
    category: objectId,
    images: z.array(z.string().min(1)).max(10, "حداکثر ۱۰ تصویر مجاز است").optional(),
    variants: z
      .array(variantSchema)
      .min(1, "حداقل یک ترکیب سایز/رنگ الزامی است")
      .max(200, "تعداد تنوع‌ها بیش از حد مجاز است")
      .superRefine(noDuplicateVariants),
    isActive: z.boolean().optional(),
  });

export const createProductSchema = buildProductSchema(createVariantSchema);
export const updateProductSchema = buildProductSchema(updateVariantSchema).partial();