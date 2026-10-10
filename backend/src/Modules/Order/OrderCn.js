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
import { calculateShipping } from "../../Config/shipping.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { address, couponCode } = req.body;

  const cart = await CartMd.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("سبد خرید شما خالی است");
  }

  // چک موجودی (بدون کسر) + ساخت آیتم‌های سفارش با اسم و عکس محصول
  const orderItems = [];
  for (const item of cart.items) {
    const product = await ProductMd.findById(item.product);
    if (!product || !product.isActive) {
      throw ApiError.badRequest("محصولی از سبد خرید شما دیگر موجود نیست");
    }
    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      throw ApiError.badRequest(`موجودی محصول "${product.name}" کافی نیست`);
    }

    orderItems.push({
      product: item.product,
      variantId: item.variantId,
      name: product.name,
      image: product.images?.[0] || null,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
    });
  }

  const rawAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // تخفیف (روی قیمت کالاها اعمال میشه، نه روی هزینه ارسال)
  let discountAmount = 0;
  let couponDoc = null;
  if (couponCode) {
    const result = await validateAndCalculate(couponCode, rawAmount);
    discountAmount = result.discountAmount;
    couponDoc = result.coupon;
  }

  // هزینه ارسال بر اساس شهر آدرس
  const { zone, cost: shippingCost } = calculateShipping(address.city);
  const payableAmount = rawAmount - discountAmount + shippingCost;

  const order = await OrderMd.create({
    user: req.user._id,
    items: orderItems,
    address,
    totalAmount: payableAmount,
    couponCode: couponDoc?.code || null,
    discountAmount,
    shippingCost,
    shippingZone: zone,
  });

  await UserMd.findByIdAndUpdate(req.user._id, { defaultAddress: address });

  if (couponDoc) {
    await CouponMd.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
  }

  const { authority, paymentUrl } = await requestZarinpalPayment({
    amount: payableAmount,
    description: `پرداخت سفارش بوتیک شاهرخ - شماره ${order._id}`,
    mobile: req.user.phone,
  });

  order.paymentAuthority = authority;
  await order.save();

  new ApiResponse(
    201,
    { orderId: order._id, payableAmount, discountAmount, shippingCost, paymentUrl },
    "سفارش ثبت شد، به درگاه پرداخت هدایت شوید"
  ).send(res);
});

// پیش‌نمایش هزینه ارسال برای صفحه Checkout
export const getShippingQuote = asyncHandler(async (req, res) => {
  const city = String(req.query.city || "").trim();
  if (!city) throw ApiError.badRequest("شهر مقصد مشخص نشده است");

  const { zone, cost, time } = calculateShipping(city);
  new ApiResponse(200, { zone, cost, time }, "هزینه ارسال").send(res);
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
    "لیست سفارش‌ها"
  ).send(res);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["processing", "shipped", "delivered", "canceled"];
  if (!allowed.includes(status)) throw ApiError.badRequest("وضعیت نامعتبر است");

  const order = await OrderMd.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw ApiError.notFound("سفارش یافت نشد");

  new ApiResponse(200, order, "وضعیت سفارش بروزرسانی شد").send(res);
});


export async function markOrderPaidAndDeductStock(order, paymentRefId = null) {
  const claimed = await OrderMd.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: "paid" } },
    {
      paymentStatus: "paid",
      status: "processing",
      ...(paymentRefId && { paymentRefId }),
    },
    { new: true }
  );

  if (!claimed) return { success: true, alreadyProcessed: true };

  let stockFailed = false;

  for (const item of claimed.items) {
    const updated = await ProductMd.findOneAndUpdate(
      {
        _id: item.product,
        variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } },
      },
      { $inc: { "variants.$.stock": -item.quantity } }
    );

    if (!updated) {
      stockFailed = true;
      console.error(`⚠️ موجودی کافی نبود: سفارش ${claimed._id} - محصول ${item.product}`);
    }
  }

  await OrderMd.updateOne(
    { _id: claimed._id },
    { stockDeducted: true, stockDeductionFailed: stockFailed }
  );

  try {
    await CartMd.updateOne({ user: claimed.user }, { items: [] });
  } catch (err) {
    console.error(`خطا در خالی‌کردن سبد کاربر ${claimed.user}:`, err.message);
  }

  return { success: !stockFailed, stockFailed };
}

export const deleteMyOrder = asyncHandler(async (req, res) => {
  const order = await OrderMd.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound("سفارش یافت نشد");

  // شرط paymentStatus تو خود حذف چک میشه تا اگه همین لحظه پرداخت شد، حذف نشه
  const removed = await OrderMd.findOneAndDelete({
    _id: order._id,
    paymentStatus: { $in: ["pending", "failed"] },
  });
  if (!removed) throw ApiError.badRequest("فقط سفارش‌های پرداخت‌نشده قابل حذف هستند");

  // یک استفاده از کد تخفیف سفارش به کوپن برگردونده میشه
  if (removed.couponCode) {
    await CouponMd.updateOne(
      { code: removed.couponCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }

  new ApiResponse(200, null, "سفارش حذف شد").send(res);
});