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
import { escapeRegex, normalizeDigits, parseDate, toPositiveInt } from "../../Utils/text.js";

const STATUS_LABELS = {
  pending_payment: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  canceled: "لغو شده",
};

// تغییر وضعیت مجاز (فقط برای سفارش‌های پرداخت‌شده)
const TRANSITIONS = {
  pending_payment: ["processing", "canceled"], // فقط برای سفارش‌های پرداخت‌شده‌ی ناسازگار (بقیه قبلاً رد میشن)
  processing: ["shipped", "canceled"],
  shipped: ["delivered", "canceled"],
};

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

const andOf = (conditions) => (conditions.length ? { $and: conditions } : {});

export const getOrderById = asyncHandler(async (req, res) => {
  const query = OrderMd.findById(req.params.id).populate("user", "name phone");
  if (req.user.role === "admin") query.populate("statusHistory.by", "name");

  const order = await query;
  if (!order) throw ApiError.notFound("سفارش یافت نشد");

  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw ApiError.forbidden("شما اجازه دیدن این سفارش را ندارید");
  }

  new ApiResponse(200, order, "جزئیات سفارش").send(res);
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const { status, paymentStatus = "all", attention } = req.query;

  if (status && !STATUS_LABELS[status]) throw ApiError.badRequest("وضعیت نامعتبر است");
  if (!["all", "paid", "unpaid"].includes(paymentStatus)) {
    throw ApiError.badRequest("وضعیت پرداخت نامعتبر است");
  }

  const fromDate = parseDate(req.query.from);
  const toDate = parseDate(req.query.to);
  if ((req.query.from && !fromDate) || (req.query.to && !toDate)) {
    throw ApiError.badRequest("بازه تاریخ نامعتبر است");
  }

  // شرایط پایه: پرداخت + تاریخ + جستجو (بدون وضعیت)
  const base = [];
  if (paymentStatus === "paid") base.push({ paymentStatus: "paid" });
  if (paymentStatus === "unpaid") base.push({ paymentStatus: { $in: ["pending", "failed"] } });

  if (fromDate || toDate) {
    const range = {};
    if (fromDate) range.$gte = fromDate;
    if (toDate) range.$lte = toDate;
    base.push({ createdAt: range });
  }

  const term = normalizeDigits(String(req.query.search || "")).trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    const users = await UserMd.find({ $or: [{ phone: regex }, { name: regex }] })
      .select("_id")
      .limit(200)
      .lean();

    const or = [
      { user: { $in: users.map((u) => u._id) } },
      { trackingCode: regex },
      { "address.receiverName": regex },
      { "address.receiverPhone": regex },
    ];

    // جستجو با کد کوتاه سفارش (۶ رقم آخر که مشتری می‌بینه) یا شناسه کامل
    if (/^[0-9a-f]{3,24}$/i.test(term)) {
      or.push({
        $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: `${term}$`, options: "i" } },
      });
    }
    base.push({ $or: or });
  }

  // «نیازمند بررسی» = مشکل موجودی در سفارشی که لغو نشده (هماهنگ با داشبورد)
  const attentionConditions = [{ stockDeductionFailed: true }, { status: { $ne: "canceled" } }];

  const scope = attention === "1" ? [...base, ...attentionConditions] : base;
  const listConditions = status ? [...scope, { status }] : scope;

  const [orders, total, countsAgg, attentionCount] = await Promise.all([
    OrderMd.find(andOf(listConditions))
      .select("-statusHistory -paymentAuthority")
      .populate("user", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    OrderMd.countDocuments(andOf(listConditions)),
    // شمارنده‌ی تب‌ها با همه فیلترها (به‌جز خود وضعیت) هماهنگه
    OrderMd.aggregate([
      { $match: andOf(scope) },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    OrderMd.countDocuments(andOf([...base, ...attentionConditions])),
  ]);

  const counts = Object.fromEntries(countsAgg.map((c) => [c._id, c.count]));

  new ApiResponse(
    200,
    { orders, total, page, pages: Math.ceil(total / limit) || 1, counts, attentionCount },
    "لیست سفارش‌ها"
  ).send(res);
});

// برگردوندن موجودی سفارش لغوشده (فقط یک‌بار)
async function restockOrder(orderId) {
  const claimed = await OrderMd.findOneAndUpdate(
    { _id: orderId, paymentStatus: "paid", stockRestored: { $ne: true } },
    { $set: { stockRestored: true } },
    { new: true }
  );
  if (!claimed) return false;

  // سفارش‌های قدیمی فلگ per-item ندارن؛ برای اون‌ها از فلگ کل سفارش استفاده میشه
  const legacyDeducted = claimed.stockDeducted && !claimed.stockDeductionFailed;

  for (const item of claimed.items) {
    const wasDeducted = item.stockDeducted || (item.stockDeducted === undefined && legacyDeducted);
    if (!wasDeducted) continue;

    await ProductMd.updateOne(
      { _id: item.product },
      { $inc: { "variants.$[v].stock": item.quantity } },
      { arrayFilters: [{ "v._id": item.variantId }] }
    );
  }
  return true;
}

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingCode } = req.body;

  const order = await OrderMd.findById(req.params.id);
  if (!order) throw ApiError.notFound("سفارش یافت نشد");
  if (order.paymentStatus !== "paid") {
    throw ApiError.badRequest("وضعیت سفارش پرداخت‌نشده قابل تغییر نیست");
  }

  // فقط ویرایش کد رهگیری
  if (!status) {
    if (!["shipped", "delivered"].includes(order.status)) {
      throw ApiError.badRequest("کد رهگیری فقط برای سفارش‌های ارسال‌شده قابل ثبت است");
    }
    order.trackingCode = trackingCode;
    await order.save();
    return new ApiResponse(200, { order, restocked: false }, "کد رهگیری ذخیره شد").send(res);
  }

  const allowed = TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `تغییر وضعیت از «${STATUS_LABELS[order.status]}» به «${STATUS_LABELS[status]}» مجاز نیست`
    );
  }

  const now = new Date();
  const set = { status };
  if (status === "shipped") {
    set.shippedAt = now;
    if (trackingCode) set.trackingCode = trackingCode;
  }
  if (status === "delivered") set.deliveredAt = now;
  if (status === "canceled") set.canceledAt = now;

  // شرط status تضمین می‌کنه دو ادمین همزمان، وضعیت رو دوبار عوض نکنن
  const updated = await OrderMd.findOneAndUpdate(
    { _id: order._id, status: order.status },
    {
      $set: set,
      $push: {
        statusHistory: {
          status,
          at: now,
          by: req.user._id,
          ...(status === "processing" && { note: "وضعیت توسط مدیر اصلاح شد" }),
        },
      },
    },
    { new: true }
  );
  if (!updated) throw ApiError.conflict("وضعیت سفارش همزمان تغییر کرد؛ صفحه را رفرش کنید");

  const restocked = status === "canceled" ? await restockOrder(updated._id) : false;

  new ApiResponse(
    200,
    { order: updated, restocked },
    restocked ? "سفارش لغو شد و موجودی به انبار برگشت" : "وضعیت سفارش بروزرسانی شد"
  ).send(res);
});

/**
 * بعد از تایید پرداخت توسط PaymentCn صدا زده میشه. بدون نیاز به transaction.
 * ۱. سفارش اتمیک «پرداخت‌شده» علامت می‌خوره (callback تکراری بی‌اثره)
 * ۲. موجودی هر آیتم با شرط کافی‌بودن کم میشه و برای هر آیتم ثبت میشه
 * ۳. اگه موجودی یه آیتم کافی نبود، سفارش پرداخت‌شده می‌مونه و برای رسیدگی ادمین علامت می‌خوره
 */
export async function markOrderPaidAndDeductStock(order, paymentRefId = null) {
  const claimed = await OrderMd.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: "paid" } },
    {
      $set: {
        paymentStatus: "paid",
        status: "processing",
        paidAt: new Date(),
        ...(paymentRefId && { paymentRefId }),
      },
      $push: { statusHistory: { status: "processing", at: new Date() } },
    },
    { new: true }
  );

  if (!claimed) return { success: true, alreadyProcessed: true };

  const deductedFlags = {};
  let stockFailed = false;

  for (let i = 0; i < claimed.items.length; i += 1) {
    const item = claimed.items[i];

    const updated = await ProductMd.findOneAndUpdate(
      {
        _id: item.product,
        variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } },
      },
      { $inc: { "variants.$.stock": -item.quantity } }
    );

    if (updated) {
      deductedFlags[`items.${i}.stockDeducted`] = true;
    } else {
      stockFailed = true;
      console.error(`⚠️ موجودی کافی نبود: سفارش ${claimed._id} - محصول ${item.product}`);
    }
  }

  await OrderMd.updateOne(
    { _id: claimed._id },
    { $set: { ...deductedFlags, stockDeducted: true, stockDeductionFailed: stockFailed } }
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

export const resolveStockIssue = asyncHandler(async (req, res) => {
  const existing = await OrderMd.findById(req.params.id);
  if (!existing) throw ApiError.notFound("سفارش یافت نشد");
  if (!existing.stockDeductionFailed) throw ApiError.badRequest("این سفارش مشکل موجودی ندارد");

  const now = new Date();
  const updated = await OrderMd.findOneAndUpdate(
    { _id: existing._id, stockDeductionFailed: true },
    {
      $set: { stockDeductionFailed: false },
      $push: {
        statusHistory: {
          status: existing.status,
          at: now,
          by: req.user._id,
          note: "مشکل موجودی بررسی و رفع شد",
        },
      },
    },
    { new: true }
  );
  if (!updated) throw ApiError.conflict("این سفارش همزمان تغییر کرد؛ صفحه را رفرش کنید");

  new ApiResponse(200, { order: updated }, "مشکل موجودی ثبت شد").send(res);
});
