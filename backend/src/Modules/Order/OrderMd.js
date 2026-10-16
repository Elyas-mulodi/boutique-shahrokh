import mongoose from "mongoose";

const { Schema } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: null },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    stockDeducted: { type: Boolean, default: false },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    province: { type: String, required: true },
    city: { type: String, required: true },
    fullAddress: { type: String, required: true },
    postalCode: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "سفارش باید حداقل یک آیتم داشته باشد",
      },
    },
    address: { type: addressSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    image: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending_payment", "processing", "shipped", "delivered", "canceled"],
      default: "pending_payment",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    shippingZone: { type: String, enum: ["mashhad", "other"], default: null },
    // اطلاعات درگاه زرین‌پال
    paymentAuthority: { type: String, index: true }, // کد Authority دریافتی از زرین‌پال
    paymentRefId: { type: String, default: null }, // کد رهگیری پرداخت موفق (RefID)

    // اگر پرداخت موفق بود ولی کسر موجودی fail شد (نباید پیش بیاد، ولی برای رصد ادمین)
    stockDeductionFailed: { type: Boolean, default: false },
    stockDeducted: { type: Boolean, default: false },

    trackingCode: { type: String, default: null, trim: true },
    shippedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    stockRestored: { type: Boolean, default: false },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
