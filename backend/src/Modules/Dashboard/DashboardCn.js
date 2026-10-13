import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import { toPositiveInt } from "../../Utils/text.js";
import {
  TEHRAN_TZ,
  startOfTehranDay,
  startOfJalaliMonth,
  addDays,
  tehranDateKey,
} from "../../Utils/dateTehran.js";
import OrderMd from "../Order/OrderMd.js";
import UserMd from "../User/UserMd.js";
import ProductMd from "../Product/ProductMd.js";
import CategoryMd from "../Category/CategoryMd.js";

// سفارش‌هایی که تو آمار فروش حساب میشن: پرداخت‌شده و لغونشده
const REVENUE_MATCH = { paymentStatus: "paid", status: { $ne: "canceled" } };
const LOW_STOCK_THRESHOLD = 5;

// days ارسال نشده یا نامعتبر → کل زمان
function rangeMatch(daysParam) {
  const days = toPositiveInt(daysParam, 0, 366);
  if (!days) return {};
  return { createdAt: { $gte: addDays(startOfTehranDay(), -(days - 1)) } };
}

async function totals(match) {
  const [row] = await OrderMd.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
  ]);
  return { revenue: row?.revenue || 0, orders: row?.orders || 0 };
}

const percentChange = (current, previous) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;

// ---------- ۱. خلاصه کلی ----------
export const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfTehranDay(now);
  const monthStart = startOfJalaliMonth(now);
  const last30Start = addDays(todayStart, -29);
  const prev30Start = addDays(todayStart, -59);

  const [
    all,
    today,
    month,
    last30,
    prev30,
    unpaidOrders,
    processingOrders,
    stockProblemOrders,
    customersTotal,
    newCustomersToday,
    newCustomersMonth,
    productsTotal,
    productsActive,
    stockAgg,
  ] = await Promise.all([
    totals(REVENUE_MATCH),
    totals({ ...REVENUE_MATCH, createdAt: { $gte: todayStart } }),
    totals({ ...REVENUE_MATCH, createdAt: { $gte: monthStart } }),
    totals({ ...REVENUE_MATCH, createdAt: { $gte: last30Start } }),
    totals({ ...REVENUE_MATCH, createdAt: { $gte: prev30Start, $lt: last30Start } }),
    OrderMd.countDocuments({ status: "pending_payment", paymentStatus: "pending" }),
    OrderMd.countDocuments({ status: "processing", paymentStatus: "paid" }),
    OrderMd.countDocuments({ stockDeductionFailed: true, status: { $ne: "canceled" } }),
    UserMd.countDocuments({ role: "customer" }),
    UserMd.countDocuments({ role: "customer", createdAt: { $gte: todayStart } }),
    UserMd.countDocuments({ role: "customer", createdAt: { $gte: monthStart } }),
    ProductMd.countDocuments(),
    ProductMd.countDocuments({ isActive: true }),
    ProductMd.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$variants" },
      {
        $group: {
          _id: null,
          low: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ["$variants.stock", 0] }, { $lte: ["$variants.stock", LOW_STOCK_THRESHOLD] }] },
                1,
                0,
              ],
            },
          },
          out: { $sum: { $cond: [{ $eq: ["$variants.stock", 0] }, 1, 0] } },
        },
      },
    ]),
  ]);

  new ApiResponse(
    200,
    {
      revenue: {
        total: all.revenue,
        today: today.revenue,
        thisMonth: month.revenue,
        last30Days: last30.revenue,
        change: percentChange(last30.revenue, prev30.revenue),
      },
      orders: {
        total: all.orders,
        today: today.orders,
        thisMonth: month.orders,
        last30Days: last30.orders,
        change: percentChange(last30.orders, prev30.orders),
        processing: processingOrders,
        unpaid: unpaidOrders,
      },
      customers: { total: customersTotal, newToday: newCustomersToday, newThisMonth: newCustomersMonth },
      products: {
        total: productsTotal,
        active: productsActive,
        lowStockVariants: stockAgg[0]?.low || 0,
        outOfStockVariants: stockAgg[0]?.out || 0,
      },
      attention: { stockProblemOrders, processingOrders },
    },
    "خلاصه آمار داشبورد"
  ).send(res);
});

// ---------- ۲. نمودار فروش: سری روزانه (گروه‌بندی هفتگی/ماهانه شمسی سمت پنل انجام میشه) ----------
export const getSalesChart = asyncHandler(async (req, res) => {
  const days = toPositiveInt(req.query.days, 30, 366);
  const from = addDays(startOfTehranDay(), -(days - 1));

  const dayKey = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TEHRAN_TZ } };

  const [sales, users, previous] = await Promise.all([
    OrderMd.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: from } } },
      { $group: { _id: dayKey, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    ]),
    UserMd.aggregate([
      { $match: { role: "customer", createdAt: { $gte: from } } },
      { $group: { _id: dayKey, count: { $sum: 1 } } },
    ]),
    totals({ ...REVENUE_MATCH, createdAt: { $gte: addDays(from, -days), $lt: from } }),
  ]);

  const salesByDay = new Map(sales.map((s) => [s._id, s]));
  const usersByDay = new Map(users.map((u) => [u._id, u.count]));

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const key = tehranDateKey(addDays(from, i));
    series.push({
      date: key,
      revenue: salesByDay.get(key)?.revenue || 0,
      orders: salesByDay.get(key)?.orders || 0,
      newUsers: usersByDay.get(key) || 0,
    });
  }

  const sum = (field) => series.reduce((acc, row) => acc + row[field], 0);

  new ApiResponse(
    200,
    {
      days,
      series,
      totals: { revenue: sum("revenue"), orders: sum("orders"), newUsers: sum("newUsers") },
      previous,
    },
    "نمودار فروش"
  ).send(res);
});

// ---------- ۳. پرفروش‌ترین محصولات ----------
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = toPositiveInt(req.query.limit, 10, 50);

  const data = await OrderMd.aggregate([
    { $match: { ...REVENUE_MATCH, ...rangeMatch(req.query.days) } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        snapshotName: { $first: "$items.name" },
        snapshotImage: { $first: "$items.image" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: { $ifNull: ["$product.name", "$snapshotName"] },
        slug: "$product.slug",
        image: { $ifNull: [{ $arrayElemAt: ["$product.images", 0] }, "$snapshotImage"] },
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  new ApiResponse(200, data, "پرفروش‌ترین محصولات").send(res);
});

// ---------- ۴. تفکیک وضعیت سفارش‌های پرداخت‌شده ----------
export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const rows = await OrderMd.aggregate([
    { $match: { paymentStatus: "paid", ...rangeMatch(req.query.days) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const data = ["processing", "shipped", "delivered", "canceled"].map((status) => ({
    status,
    count: map[status] || 0,
  }));

  new ApiResponse(200, data, "تفکیک وضعیت سفارش‌ها").send(res);
});

// ---------- ۵. فروش به تفکیک دسته‌بندی اصلی ----------
export const getSalesByCategory = asyncHandler(async (req, res) => {
  const [rows, categories] = await Promise.all([
    OrderMd.aggregate([
      { $match: { ...REVENUE_MATCH, ...rangeMatch(req.query.days) } },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          sold: { $sum: "$items.quantity" },
        },
      },
    ]),
    CategoryMd.find().select("name parent").lean(),
  ]);

  const byId = new Map(categories.map((c) => [String(c._id), c]));
  const rootOf = (id) => {
    let current = byId.get(String(id));
    let guard = 0;
    while (current?.parent && guard < 10) {
      current = byId.get(String(current.parent));
      guard += 1;
    }
    return current;
  };

  // فروش زیردسته‌ها به دسته اصلی‌شون اضافه میشه
  const merged = new Map();
  for (const row of rows) {
    const root = rootOf(row._id);
    if (!root) continue;
    const key = String(root._id);
    const entry = merged.get(key) || { categoryId: root._id, name: root.name, revenue: 0, sold: 0 };
    entry.revenue += row.revenue;
    entry.sold += row.sold;
    merged.set(key, entry);
  }

  const data = [...merged.values()].sort((a, b) => b.revenue - a.revenue);
  new ApiResponse(200, data, "فروش بر اساس دسته‌بندی").send(res);
});

// ---------- ۶. فروش به تفکیک استان ----------
export const getSalesByProvince = asyncHandler(async (req, res) => {
  const data = await OrderMd.aggregate([
    { $match: { ...REVENUE_MATCH, ...rangeMatch(req.query.days) } },
    {
      $group: {
        _id: "$address.province",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $project: { _id: 0, province: "$_id", orders: 1, revenue: 1 } },
  ]);

  new ApiResponse(200, data, "فروش بر اساس استان").send(res);
});

// ---------- ۷. آخرین سفارش‌های پرداخت‌شده ----------
export const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = toPositiveInt(req.query.limit, 8, 50);

  const orders = await OrderMd.find({ paymentStatus: "paid" })
    .select("totalAmount status createdAt user address.city items")
    .populate("user", "name phone")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  new ApiResponse(200, orders, "آخرین سفارش‌ها").send(res);
});

// ---------- ۸. موجودی کم یا تمام‌شده ----------
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = toPositiveInt(req.query.threshold, LOW_STOCK_THRESHOLD, 1000);

  const data = await ProductMd.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: threshold } } },
    { $sort: { "variants.stock": 1, name: 1 } },
    { $limit: 100 },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: 1,
        slug: 1,
        image: { $arrayElemAt: ["$images", 0] },
        size: "$variants.size",
        color: "$variants.color",
        colorHex: "$variants.colorHex",
        stock: "$variants.stock",
      },
    },
  ]);

  new ApiResponse(200, data, "موجودی کم").send(res);
});

// ---------- ۹. مشتریان برتر ----------
export const getTopCustomers = asyncHandler(async (req, res) => {
  const limit = toPositiveInt(req.query.limit, 10, 50);

  const data = await OrderMd.aggregate([
    { $match: { ...REVENUE_MATCH, ...rangeMatch(req.query.days) } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: { $ifNull: ["$user.name", "کاربر حذف‌شده"] },
        phone: "$user.phone",
        totalSpent: 1,
        ordersCount: 1,
      },
    },
  ]);

  new ApiResponse(200, data, "مشتریان برتر").send(res);
});