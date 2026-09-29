import mongoose from "mongoose";
import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import OrderMd from "./OrderMd.js";
import CartMd from "../Cart/CartMd.js";
import ProductMd from "../Product/ProductMd.js";
import UserMd from "../User/UserMd.js";
import CouponMd from "../Coupon/CouponMd.js";
import { validateAndCalculate } from "../Coupon/CouponCn.js";
import { requestZarinpalPayment } from "../Payment/PaymentCn.js";

/**
 * ساخت سفارش از روی سبد خرید کاربر + درخواست پرداخت از زرین‌پال.
 * موجودی در این مرحله فقط چک میشه، کسر نمیشه (کسر موجودی بعد از پرداخت موفق انجام میشه).
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { address, couponCode } = req.body;

  // ۱. سبد خرید کاربر رو بگیر
  const cart = await CartMd.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("سبد خرید شما خالی است");
  }

  // ۲. موجودی هر آیتم رو چک کن (بدون کسر کردن)
  for (const item of cart.items) {
    const product = await ProductMd.findById(item.product);
    if (!product || !product.isActive) {
      throw ApiError.badRequest("محصولی از سبد خرید شما دیگر موجود نیست");
    }
    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      throw ApiError.badRequest(`موجودی محصول "${product.name}" کافی نیست`);
    }
  }

  // ۳. مبلغ خام سفارش
  const rawAmount = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  // ۴. اگر کد تخفیف داده شده، اعتبارسنجی و محاسبه تخفیف
  let discountAmount = 0;
  let couponDoc = null;

  if (couponCode) {
    const result = await validateAndCalculate(couponCode, rawAmount);
    discountAmount = result.discountAmount;
    couponDoc = result.coupon;
  }

  const payableAmount = rawAmount - discountAmount;

  // ۵. ساخت سفارش با مبلغ نهایی (بعد از تخفیف)
  const order = await OrderMd.create({
    user: req.user._id,
    items: cart.items.map((i) => ({
      product: i.product,
      variantId: i.variantId,
      name: i.size,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: i.price,
    })),
    address,
    totalAmount: payableAmount,
    couponCode: couponDoc?.code || null,
    discountAmount,
  });

  // ۶. آدرس رو به‌عنوان پیش‌فرض روی پروفایل کاربر ذخیره کن
  await UserMd.findByIdAndUpdate(req.user._id, { defaultAddress: address });

  // ۷. اگر کد تخفیف مصرف شد، شمارنده استفاده‌ش رو زیاد کن
  if (couponDoc) {
    await CouponMd.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
  }

  // ۸. درخواست پرداخت از زرین‌پال با مبلغ نهایی
  const { authority, paymentUrl } = await requestZarinpalPayment({
    amount: payableAmount,
    description: `پرداخت سفارش بوتیک شاهرخ - شماره ${order._id}`,
    mobile: req.user.phone,
  });

  order.paymentAuthority = authority;
  await order.save();

  new ApiResponse(
    201,
    { orderId: order._id, payableAmount, discountAmount, paymentUrl },
    "سفارش ثبت شد، به درگاه پرداخت هدایت شوید",
  ).send(res);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderMd.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  new ApiResponse(200, orders, "سفارش‌های من").send(res);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await OrderMd.findById(req.params.id);
  if (!order) throw ApiError.notFound("سفارش یافت نشد");

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw ApiError.forbidden("شما اجازه دیدن این سفارش را ندارید");
  }

  new ApiResponse(200, order, "جزئیات سفارش").send(res);
});

// --- ادمین ---
export const listAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    OrderMd.find(filter)
      .populate("user", "name phone")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    OrderMd.countDocuments(filter),
  ]);

  new ApiResponse(
    200,
    { orders, total, page: Number(page), pages: Math.ceil(total / limit) },
    "لیست سفارش‌ها",
  ).send(res);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["processing", "shipped", "delivered", "canceled"];
  if (!allowed.includes(status)) throw ApiError.badRequest("وضعیت نامعتبر است");

  const order = await OrderMd.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!order) throw ApiError.notFound("سفارش یافت نشد");

  new ApiResponse(200, order, "وضعیت سفارش بروزرسانی شد").send(res);
});

// --- استفاده داخلی توسط PaymentCn بعد از تایید پرداخت ---
export async function markOrderPaidAndDeductStock(order) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const item of order.items) {
      const updated = await ProductMd.findOneAndUpdate(
        {
          _id: item.product,
          "variants._id": item.variantId,
          "variants.stock": { $gte: item.quantity },
        },
        { $inc: { "variants.$.stock": -item.quantity } },
        { new: true, session },
      );
      if (!updated) {
        throw new Error(`STOCK_INSUFFICIENT:${item.product}`);
      }
    }

    order.status = "processing";
    order.paymentStatus = "paid";
    await order.save({ session });

    await CartMd.findOneAndUpdate(
      { user: order.user },
      { items: [] },
      { session },
    );

    await session.commitTransaction();
    return { success: true };
  } catch (err) {
    await session.abortTransaction();

    // پرداخت انجام شده ولی کسر موجودی ممکن نشد → باید توسط ادمین دستی رسیدگی بشه (رفاند یا تامین کالا)
    order.paymentStatus = "paid";
    order.stockDeductionFailed = true;
    await order.save();

    console.error(
      `⚠️ CRITICAL: Stock deduction failed for paid order ${order._id}:`,
      err.message,
    );
    return { success: false, error: err.message };
  } finally {
    session.endSession();
  }
}
