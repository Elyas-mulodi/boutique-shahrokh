import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { escapeRegex, normalizeDigits, toPositiveInt } from "../../Utils/text.js";
import CouponMd from "./CouponMd.js";
import OrderMd from "../Order/OrderMd.js";
import CartMd from "../Cart/CartMd.js";
import ProductMd from "../Product/ProductMd.js";

// سقف استفاده پر شده (usageLimit خالی = نامحدود)
const EXHAUSTED = {
  $and: [
    { $ne: [{ $ifNull: ["$usageLimit", null] }, null] },
    { $gte: ["$usedCount", "$usageLimit"] },
  ],
};

// اولویت وضعیت‌ها: غیرفعال > منقضی > ظرفیت تمام‌شده > فعال
function statusFilter(status, now) {
  switch (status) {
    case "inactive":
      return { isActive: false };
    case "expired":
      return { isActive: true, expiresAt: { $lte: now } };
    case "exhausted":
      return { isActive: true, expiresAt: { $gt: now }, $expr: EXHAUSTED };
    case "active":
      return { isActive: true, expiresAt: { $gt: now }, $expr: { $not: [EXHAUSTED] } };
    default:
      return {};
  }
}

function getStatus(coupon, now) {
  if (coupon.isActive === false) return "inactive";
  if (new Date(coupon.expiresAt) <= now) return "expired";
  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return "exhausted";
  }
  return "active";
}

// ---------- منطق مشترک (فروشگاه) ----------
export async function validateAndCalculate(rawCode, orderAmount) {
  const code = normalizeDigits(String(rawCode || ""))
    .trim()
    .toUpperCase();

  const coupon = await CouponMd.findOne({ code, isActive: true });
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد یا غیرفعال است");
  if (coupon.expiresAt <= new Date()) throw ApiError.badRequest("کد تخفیف منقضی شده است");

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw ApiError.badRequest("سقف استفاده از این کد تخفیف پر شده است");
  }

  const minOrder = coupon.minOrderAmount || 0;
  if (orderAmount < minOrder) {
    throw ApiError.badRequest(
      `حداقل مبلغ سفارش برای این کد ${minOrder.toLocaleString("fa-IR")} تومان است`
    );
  }

  let discountAmount =
    coupon.type === "percent" ? Math.floor((orderAmount * coupon.value) / 100) : coupon.value;
  if (coupon.type === "percent" && coupon.maxDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }
  discountAmount = Math.min(discountAmount, orderAmount); // تخفیف بیشتر از مبلغ سفارش نمیشه

  return { coupon, discountAmount };
}

// رزرو اتمیک یک بار استفاده؛ اگه همزمان ظرفیت تموم شده باشه null برمی‌گردونه
export function claimCouponUse(couponId) {
  return CouponMd.findOneAndUpdate(
    {
      _id: couponId,
      isActive: true,
      expiresAt: { $gt: new Date() },
      $expr: { $not: [EXHAUSTED] },
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
}

// آزادکردن یک بار استفاده (سفارش ساخته نشد یا حذف شد)
export async function releaseCouponUse(code) {
  if (!code) return;
  await CouponMd.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}

// پیش‌نمایش تخفیف روی سبد فعلی بدون مصرف کد (قیمت‌ها از خود محصولات خونده میشه)
export const previewCoupon = asyncHandler(async (req, res) => {
  const cart = await CartMd.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw ApiError.badRequest("سبد خرید شما خالی است");

  const products = await ProductMd.find({
    _id: { $in: cart.items.map((i) => i.product) },
    isActive: true,
  })
    .select("price variants._id")
    .lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderAmount = cart.items.reduce((sum, item) => {
    const product = byId.get(String(item.product));
    const valid = product?.variants.some((v) => String(v._id) === String(item.variantId));
    return valid ? sum + product.price * item.quantity : sum;
  }, 0);

  if (orderAmount === 0) throw ApiError.badRequest("سبد خرید شما خالی است");

  const { discountAmount } = await validateAndCalculate(req.body.code, orderAmount);

  new ApiResponse(
    200,
    { discountAmount, payableAmount: orderAmount - discountAmount },
    "کد تخفیف معتبر است"
  ).send(res);
});

// ---------- ادمین ----------
export const list = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const { status = "all", sort = "newest" } = req.query;
  const now = new Date();

  // فیلتر جستجو جداست تا شمارنده‌ی وضعیت‌ها با جستجو هماهنگ باشن
  const searchFilter = {};
  const term = normalizeDigits(String(req.query.search || "")).trim();
  if (term) searchFilter.code = new RegExp(escapeRegex(term), "i");

  const filter = { ...searchFilter, ...statusFilter(status, now) };

  const sortOption =
    sort === "expiry"
      ? { expiresAt: 1, _id: 1 }
      : sort === "usage"
        ? { usedCount: -1, _id: 1 }
        : { createdAt: -1, _id: -1 };

  const [coupons, total, countsAgg] = await Promise.all([
    CouponMd.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CouponMd.countDocuments(filter),
    CouponMd.aggregate([
      { $match: searchFilter },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ["$isActive", false] }, then: "inactive" },
                { case: { $lte: ["$expiresAt", now] }, then: "expired" },
                { case: EXHAUSTED, then: "exhausted" },
              ],
              default: "active",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // آمار واقعی فروش با هر کد (فقط سفارش‌های پرداخت‌شده و لغونشده)
  const statsRows = coupons.length
    ? await OrderMd.aggregate([
        {
          $match: {
            couponCode: { $in: coupons.map((c) => c.code) },
            paymentStatus: "paid",
            status: { $ne: "canceled" },
          },
        },
        {
          $group: {
            _id: "$couponCode",
            paidOrders: { $sum: 1 },
            discountTotal: { $sum: "$discountAmount" },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ])
    : [];
  const statsByCode = new Map(statsRows.map((s) => [s._id, s]));

  const data = coupons.map((coupon) => {
    const s = statsByCode.get(coupon.code);
    return {
      ...coupon,
      status: getStatus(coupon, now),
      stats: {
        paidOrders: s?.paidOrders || 0,
        discountTotal: s?.discountTotal || 0,
        revenue: s?.revenue || 0,
      },
    };
  });

  const byStatus = Object.fromEntries(countsAgg.map((c) => [c._id, c.count]));
  const counts = {
    active: byStatus.active || 0,
    inactive: byStatus.inactive || 0,
    expired: byStatus.expired || 0,
    exhausted: byStatus.exhausted || 0,
  };
  counts.all = counts.active + counts.inactive + counts.expired + counts.exhausted;

  new ApiResponse(
    200,
    { coupons: data, total, page, pages: Math.ceil(total / limit) || 1, counts },
    "لیست کدهای تخفیف"
  ).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;

  const expiresAt = new Date(body.expiresAt);
  if (expiresAt <= new Date()) throw ApiError.badRequest("تاریخ انقضا باید در آینده باشد");

  if (await CouponMd.exists({ code: body.code })) {
    throw ApiError.conflict("این کد تخفیف قبلا ثبت شده است");
  }

  const coupon = await CouponMd.create({
    code: body.code,
    type: body.type,
    value: body.value,
    maxDiscount: body.type === "percent" ? (body.maxDiscount ?? null) : null,
    minOrderAmount: body.minOrderAmount ?? 0,
    usageLimit: body.usageLimit ?? null,
    expiresAt,
    isActive: body.isActive ?? true,
  });

  new ApiResponse(201, coupon, "کد تخفیف ایجاد شد").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const coupon = await CouponMd.findById(req.params.id);
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد");

  const body = req.body;

  if (body.expiresAt !== undefined) {
    const next = new Date(body.expiresAt);
    if (next.getTime() !== coupon.expiresAt.getTime() && next <= new Date()) {
      throw ApiError.badRequest("تاریخ انقضای جدید باید در آینده باشد");
    }
    coupon.expiresAt = next;
  }
  if (body.type !== undefined) coupon.type = body.type;
  if (body.value !== undefined) coupon.value = body.value;
  if (body.maxDiscount !== undefined) coupon.maxDiscount = body.maxDiscount;
  if (body.minOrderAmount !== undefined) coupon.minOrderAmount = body.minOrderAmount;
  if (body.usageLimit !== undefined) coupon.usageLimit = body.usageLimit;
  if (body.isActive !== undefined) coupon.isActive = body.isActive;

  if (coupon.type === "percent" && coupon.value > 100) {
    throw ApiError.badRequest("درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد");
  }
  if (coupon.type === "fixed") coupon.maxDiscount = null;

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usageLimit < coupon.usedCount
  ) {
    throw ApiError.badRequest(
      `سقف استفاده نمی‌تواند کمتر از تعداد استفاده‌شده (${coupon.usedCount.toLocaleString("fa-IR")}) باشد`
    );
  }

  await coupon.save();

  new ApiResponse(200, coupon, "کد تخفیف بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const coupon = await CouponMd.findById(req.params.id);
  if (!coupon) throw ApiError.notFound("کد تخفیف یافت نشد");

  if (await OrderMd.exists({ couponCode: coupon.code })) {
    throw ApiError.conflict(
      "این کد تخفیف در سفارش‌ها استفاده شده و قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید"
    );
  }

  await coupon.deleteOne();

  new ApiResponse(200, null, "کد تخفیف حذف شد").send(res);
});
