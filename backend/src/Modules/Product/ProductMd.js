import mongoose from "mongoose";

const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: "" },
    price: { type: Number, required: [true, "قیمت محصول الزامی است"], min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: { type: [String], default: [] },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "حداقل یک ترکیب سایز/رنگ الزامی است",
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });

productSchema.virtual("totalStock").get(function () {
  return (this.variants || []).reduce((sum, v) => sum + v.stock, 0);
});
productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
