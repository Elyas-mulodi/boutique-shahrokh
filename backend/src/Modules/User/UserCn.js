import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { escapeRegex, normalizeDigits, toPositiveInt } from "../../Utils/text.js";
import * as UserSr from "./UserSr.js";
import UserMd from "./UserMd.js";
import OrderMd from "../Order/OrderMd.js";

// سفارش‌هایی که تو آمار خرید حساب میشن (هماهنگ با داشبورد)
const REVENUE_MATCH = { paymentStatus: "paid", status: { $ne: "canceled" } };

// ---------- کاربر ----------
export const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user.toSafeObject(), "پروفایل کاربر").send(res);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await UserSr.updateProfile(req.user._id, req.body);
  new ApiResponse(200, user.toSafeObject(), "پروفایل بروزرسانی شد").send(res);
});

export const setAddress = asyncHandler(async (req, res) => {
  const user = await UserSr.setDefaultAddress(req.user._id, req.body);
  new ApiResponse(200, user.defaultAddress, "آدرس ذخیره شد").send(res);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await UserMd.findById(req.user._id).select("+password");
  if (!user) throw ApiError.notFound("کاربر یافت نشد");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest("رمز عبور فعلی نادرست است");

  if (currentPassword === newPassword) {
    throw ApiError.badRequest("رمز عبور جدید باید با رمز فعلی متفاوت باشد");
  }

  user.password = newPassword; // هش‌شدن تو pre-save مدل انجام میشه
  await user.save();

  new ApiResponse(200, null, "رمز عبور با موفقیت تغییر کرد").send(res);
});

// ---------- ادمین ----------
export const listUsers = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const { role, blocked, sort = "newest" } = req.query;

  // فیلتر جستجو جداست تا شمارنده‌ها با جستجو هماهنگ باشن
  const searchFilter = {};
  const term = normalizeDigits(String(req.query.search || "")).trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    searchFilter.$or = [{ name: regex }, { phone: regex }];
  }

  const filter = { ...searchFilter };
  if (role === "admin" || role === "customer") filter.role = role;
  if (blocked === "true") filter.isBlocked = true;
  if (blocked === "false") filter.isBlocked = { $ne: true };

  const sortOption =
    sort === "oldest"
      ? { createdAt: 1, _id: 1 }
      : sort === "name"
        ? { name: 1, _id: 1 }
        : { createdAt: -1, _id: -1 };

  const query = UserMd.find(filter)
    .select("-defaultAddress -__v")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  if (sort === "name") query.collation({ locale: "fa" });

  const [users, total, countsAgg] = await Promise.all([
    query,
    UserMd.countDocuments(filter),
    UserMd.aggregate([
      { $match: searchFilter },
      {
        $group: {
          _id: null,
          all: { $sum: 1 },
          customers: { $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          blocked: { $sum: { $cond: ["$isBlocked", 1, 0] } },
        },
      },
    ]),
  ]);

  // آمار خرید کاربران همین صفحه
  const stats = users.length
    ? await OrderMd.aggregate([
        { $match: { ...REVENUE_MATCH, user: { $in: users.map((u) => u._id) } } },
        {
          $group: {
            _id: "$user",
            ordersCount: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            lastOrderAt: { $max: { $ifNull: ["$paidAt", "$createdAt"] } },
          },
        },
      ])
    : [];
  const statsByUser = new Map(stats.map((s) => [String(s._id), s]));

  const data = users.map((user) => {
    const s = statsByUser.get(String(user._id));
    return {
      ...user,
      isBlocked: Boolean(user.isBlocked),
      ordersCount: s?.ordersCount || 0,
      totalSpent: s?.totalSpent || 0,
      lastOrderAt: s?.lastOrderAt || null,
    };
  });

  const c = countsAgg[0] || {};

  new ApiResponse(
    200,
    {
      users: data,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      counts: {
        all: c.all || 0,
        customers: c.customers || 0,
        admins: c.admins || 0,
        blocked: c.blocked || 0,
      },
    },
    "لیست کاربران"
  ).send(res);
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await UserMd.findById(req.params.id).select("-__v").lean();
  if (!user) throw ApiError.notFound("کاربر یافت نشد");

  const [statsRows, canceledCount, paidCount, orders] = await Promise.all([
    OrderMd.aggregate([
      { $match: { ...REVENUE_MATCH, user: user._id } },
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderAt: { $max: { $ifNull: ["$paidAt", "$createdAt"] } },
        },
      },
    ]),
    OrderMd.countDocuments({ user: user._id, paymentStatus: "paid", status: "canceled" }),
    OrderMd.countDocuments({ user: user._id, paymentStatus: "paid" }),
    OrderMd.find({ user: user._id, paymentStatus: "paid" })
      .select(
        "totalAmount status paymentStatus createdAt paidAt items stockDeductionFailed address.city"
      )
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .lean(),
  ]);

  const s = statsRows[0];
  const ordersCount = s?.ordersCount || 0;
  const totalSpent = s?.totalSpent || 0;

  new ApiResponse(
    200,
    {
      user: { ...user, isBlocked: Boolean(user.isBlocked) },
      stats: {
        ordersCount,
        totalSpent,
        averageOrder: ordersCount ? Math.round(totalSpent / ordersCount) : 0,
        lastOrderAt: s?.lastOrderAt || null,
        canceledCount,
        paidCount,
      },
      orders,
    },
    "جزئیات کاربر"
  ).send(res);
});

export const setBlocked = asyncHandler(async (req, res) => {
  const { blocked } = req.body;

  const user = await UserMd.findById(req.params.id).select("role isBlocked");
  if (!user) throw ApiError.notFound("کاربر یافت نشد");

  if (blocked) {
    if (String(user._id) === String(req.user._id)) {
      throw ApiError.badRequest("نمی‌توانید حساب خودتان را مسدود کنید");
    }
    if (user.role === "admin") throw ApiError.forbidden("مسدودکردن حساب مدیر مجاز نیست");
  }

  const updated = await UserMd.findByIdAndUpdate(
    user._id,
    { isBlocked: blocked },
    { new: true }
  ).select("-__v");

  new ApiResponse(200, updated, blocked ? "کاربر مسدود شد" : "کاربر آزاد شد").send(res);
});
