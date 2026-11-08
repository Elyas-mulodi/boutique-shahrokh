import { z } from "zod";
import { BANNER_PLACEMENTS } from "./BannerMd.js";

// ⚠️ پیشوند آدرس آپلودهای پروژه‌ی خودت رو اینجا بذار (اگه آدرس کامل ذخیره می‌کنی، refine رو عوض کن)
const UPLOADS_PREFIX = "/uploads/";

const imageUrl = z
  .string()
  .trim()
  .max(500, "آدرس تصویر بیش از حد طولانی است")
  .refine((v) => v.startsWith(UPLOADS_PREFIX) && !v.includes(".."), `آدرس تصویر باید با ${UPLOADS_PREFIX} شروع شود`);

// فقط مسیر داخلی سایت یا https (جلوی javascript: و مشابهش رو می‌گیره)
const link = z
  .string()
  .trim()
  .max(300, "لینک بیش از حد طولانی است")
  .refine(
    (v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//i.test(v),
    "لینک باید مسیر داخلی (مثل /products) یا آدرس کامل https باشد"
  );

const focalAxis = z.number({ invalid_type_error: "نقطه‌ی تمرکز باید عدد باشد" }).min(0).max(100);

const fields = {
  placement: z.enum(BANNER_PLACEMENTS, { errorMap: () => ({ message: "جایگاه بنر نامعتبر است" }) }),
  eyebrow: z.string().trim().max(60, "متن بالای تیتر بیش از حد طولانی است").optional(),
  title: z
    .string({ required_error: "تیتر بنر الزامی است" })
    .trim()
    .min(2, "تیتر بنر معتبر نیست")
    .max(120, "تیتر بنر بیش از حد طولانی است"),
  subtitle: z.string().trim().max(300, "توضیح بنر بیش از حد طولانی است").optional(),
  ctaText: z.string().trim().max(40, "متن دکمه بیش از حد طولانی است").optional(),
  ctaLink: link.or(z.literal("")).optional(),
  image: imageUrl.nullable().optional(), // الزامی بودنش برای هیرو توی مدل چک میشه
  imageMobile: imageUrl.nullable().optional(),
  imageAlt: z.string().trim().max(150, "متن جایگزین تصویر بیش از حد طولانی است").optional(),
  // x و y باید با هم بیان، وگرنه یکی‌شون موقع ویرایش پاک میشه
  focalPoint: z.object({ x: focalAxis, y: focalAxis }).optional(),
  textColor: z.enum(["light", "dark"]).optional(),
  overlay: z.number().int("تیرگی باید عدد صحیح باشد").min(0).max(80, "تیرگی حداکثر ۸۰ است").optional(),
  order: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
};

export const createBannerSchema = z.object(fields);
export const updateBannerSchema = z.object(fields).partial();