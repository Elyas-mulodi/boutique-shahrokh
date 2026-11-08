import mongoose from "mongoose";

const { Schema } = mongoose;

// جایگاه‌های بنر توی سایت؛ جایگاه جدید = یه مقدار جدید اینجا
export const BANNER_PLACEMENTS = ["hero", "promo"];

const focalAxis = { type: Number, min: 0, max: 100, default: 50 };

const bannerSchema = new Schema(
  {
    placement: {
      type: String,
      enum: { values: BANNER_PLACEMENTS, message: "جایگاه بنر نامعتبر است" },
      required: [true, "جایگاه بنر الزامی است"],
    },

    // متن‌ها
    eyebrow: { type: String, trim: true, default: "" }, // متن کوچیک بالای تیتر
    title: { type: String, required: [true, "تیتر بنر الزامی است"], trim: true },
    subtitle: { type: String, trim: true, default: "" },
    ctaText: { type: String, trim: true, default: "" },
    ctaLink: { type: String, trim: true, default: "" },

    // تصویر: برای هیرو الزامیه، برای بنرهای دیگه اختیاری
    image: {
      type: String,
      default: null,
      required: [
        function () {
          return this.placement === "hero";
        },
        "تصویر بنر اصلی الزامی است",
      ],
    },
    imageMobile: { type: String, default: null }, // اگه نباشه از image استفاده میشه
    imageAlt: { type: String, trim: true, default: "" },

    // ظاهر
    focalPoint: { x: focalAxis, y: focalAxis }, // نقطه‌ی مهم عکس (درصد)، برای object-position
    textColor: { type: String, enum: ["light", "dark"], default: "light" }, // light = متن سفید
    overlay: { type: Number, min: 0, max: 80, default: 40 }, // تیرگی روی عکس (درصد)

    // مدیریت
    order: { type: Number, default: 0 }, // کوچیک‌تر = اول
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: null }, // اختیاری: زمان‌بندی نمایش
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bannerSchema.index({ placement: 1, isActive: 1, order: 1 });

// قانون‌هایی که به چند فیلد با هم بستگی دارن (روی سند نهایی چک میشن، چه ساخت چه ویرایش)
bannerSchema.pre("validate", function () {
  if (Boolean(this.ctaText) !== Boolean(this.ctaLink)) {
    this.invalidate("ctaLink", "متن دکمه و لینک دکمه باید با هم پر شوند");
  }
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) {
    this.invalidate("endsAt", "زمان پایان باید بعد از زمان شروع باشد");
  }
});

export default mongoose.model("Banner", bannerSchema);
