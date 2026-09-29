import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import CouponMd from "./CouponMd.js";

// --- ادمین ---
export const create = asyncHandler(async (req, res) => {
  const exists = await CouponMd.findOne({ code: req.body.code.toUpperCase() });
  if (exists) throw ApiError.conflict("این کد تخفیف قبلا ثبت شده است");

  const coupon = await CouponMd.create(req.body);
  new ApiResponse(201, coupon, "کد تخفیف ایجاد شد").send(res);
});

export const list = asyncHandler(async (req, res) => {
  const coupons = await CouponMd.find().sort({ createdAt: -1 });
  new ApiResponse(200, coupons, "لیست کدهای تخفیف").send(res);
});

export const toggleActive = asyncHandler(async (req, res) => {
  const coupon = await CouponMd.findById(req.params.id);
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد");

  coupon.isActive = !coupon.isActive;
  await coupon.save();
  new ApiResponse(200, coupon, "وضعیت کد تخفیف تغییر کرد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const coupon = await CouponMd.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد");
  new ApiResponse(200, null, "کد تخفیف حذف شد").send(res);
});

/**
 * اعتبارسنجی و محاسبه تخفیف — هم توسط روت پیش‌نمایش سبد استفاده میشه، هم داخل OrderCn هنگام ثبت سفارش.
 * @returns {Promise<{coupon, discountAmount}>}
 */
export async function validateAndCalculate(code, orderAmount) {
  const coupon = await CouponMd.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد یا غیرفعال است");
  if (coupon.expiresAt < new Date()) throw ApiError.badRequest("کد تخفیف منقضی شده است");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest("سقف استفاده از این کد تخفیف پر شده است");
  }
  if (orderAmount < coupon.minOrderAmount) {
    throw ApiError.badRequest(`حداقل مبلغ سفارش برای این کد ${coupon.minOrderAmount} تومان است`);
  }

  let discountAmount = coupon.type === "percent" ? (orderAmount * coupon.value) / 100 : coupon.value;

  if (coupon.type === "percent" && coupon.maxDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }
  discountAmount = Math.min(discountAmount, orderAmount); // تخفیف بیشتر از مبلغ سفارش نشه

  return { coupon, discountAmount };
}

// --- کاربر: فقط پیش‌نمایش تخفیف روی سبد فعلی، بدون مصرف کد ---
export const previewCoupon = asyncHandler(async (req, res) => {
  const CartMd = (await import("../Cart/CartMd.js")).default;
  const cart = await CartMd.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw ApiError.badRequest("سبد خرید شما خالی است");

  const orderAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { discountAmount } = await validateAndCalculate(req.body.code, orderAmount);

  new ApiResponse(200, { discountAmount, payableAmount: orderAmount - discountAmount }, "کد تخفیف معتبر است").send(res);
});