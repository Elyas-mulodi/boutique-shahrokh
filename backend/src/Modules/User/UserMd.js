import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

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

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "نام خانوادگی الزامی است"], trim: true },
    phone: {
      type: String,
      required: [true, "شماره موبایل الزامی است"],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "رمز عبور الزامی است"],
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    defaultAddress: { type: addressSchema, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model("User", userSchema);