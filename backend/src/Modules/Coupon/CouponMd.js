import mongoose from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 }, // درصد یا مبلغ ثابت
    maxDiscount: { type: Number, default: null }, // سقف تخفیف برای نوع percent
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }, // null = نامحدود
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);