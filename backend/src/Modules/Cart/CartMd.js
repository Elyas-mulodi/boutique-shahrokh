import mongoose from "mongoose";

const { Schema } = mongoose;

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    colorHex: { type: String, default: null },
  },
  { _id: true }
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});
cartSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Cart", cartSchema);
