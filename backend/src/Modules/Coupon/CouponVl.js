import { z } from "zod";

const MAX_AMOUNT = 10000000000;
const MAX_USAGE = 10000000;

const amount = (label, min) =>
  z
    .number({ required_error: `${label} الزامی است`, invalid_type_error: `${label} باید عدد باشد` })
    .int(`${label} باید عدد صحیح باشد`)
    .min(min, min > 0 ? `${label} باید بیشتر از صفر باشد` : `${label} نمی‌تواند منفی باشد`)
    .max(MAX_AMOUNT, `${label} بیش از حد مجاز است`);

const codeField = z
  .string({ required_error: "کد تخفیف الزامی است" })
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z0-9_-]{3,20}$/,
        "کد باید ۳ تا ۲۰ کاراکتر و فقط شامل حروف انگلیسی، عدد، خط تیره یا زیرخط باشد"
      )
  );

const fields = {
  type: z.enum(["percent", "fixed"], { errorMap: () => ({ message: "نوع تخفیف نامعتبر است" }) }),
  value: amount("مقدار تخفیف", 1),
  maxDiscount: amount("سقف تخفیف", 1).nullable().optional(),
  minOrderAmount: amount("حداقل مبلغ سفارش", 0).optional(),
  usageLimit: z
    .number({ invalid_type_error: "سقف استفاده باید عدد باشد" })
    .int("سقف استفاده باید عدد صحیح باشد")
    .min(1, "سقف استفاده باید حداقل ۱ باشد")
    .max(MAX_USAGE, "سقف استفاده بیش از حد مجاز است")
    .nullable()
    .optional(),
  expiresAt: z
    .string({ required_error: "تاریخ انقضا الزامی است" })
    .datetime({ message: "تاریخ انقضا معتبر نیست" }),
  isActive: z.boolean().optional(),
};

const percentCheck = [
  (data) => !(data.type === "percent" && data.value !== undefined && data.value > 100),
  { path: ["value"], message: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد" },
];

// کد بعد از ساخت قابل تغییر نیست؛ به همین دلیل تو اسکیمای ویرایش نیست
export const createCouponSchema = z.object({ code: codeField, ...fields }).refine(...percentCheck);
export const updateCouponSchema = z
  .object(fields)
  .partial()
  .refine(...percentCheck);

export const applyCouponSchema = z.object({
  code: z
    .string({ required_error: "کد تخفیف الزامی است" })
    .trim()
    .min(3, "کد تخفیف معتبر نیست")
    .max(40, "کد تخفیف معتبر نیست"),
});
