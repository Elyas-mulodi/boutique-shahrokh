import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import OrderMd from "../Order/OrderMd.js";
import UserMd from "../User/UserMd.js";
import ProductMd from "../Product/ProductMd.js";

const PAID_MATCH = { paymentStatus: "paid" };

// ---------- ۱. خلاصه کلی (کارت‌های بالای داشبورد) ----------
export const getOverview = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalRevenueAgg,
    todayRevenueAgg,
    monthRevenueAgg,
    totalOrders,
    todayOrders,
    pendingOrders,
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    lowStockCount,
  ] = await Promise.all([
    OrderMd.aggregate([{ $match: PAID_MATCH }, { $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
    OrderMd.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]),
    OrderMd.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]),
    OrderMd.countDocuments(PAID_MATCH),
    OrderMd.countDocuments({ ...PAID_MATCH, createdAt: { $gte: startOfToday } }),
    OrderMd.countDocuments({ status: "pending_payment" }),
    UserMd.countDocuments({ role: "customer" }),
    UserMd.countDocuments({ role: "customer", createdAt: { $gte: startOfMonth } }),
    ProductMd.countDocuments({ isActive: true }),
    ProductMd.countDocuments({ "variants.stock": { $lte: 5 } }),
  ]);

  new ApiResponse(
    200,
    {
      revenue: {
        total: totalRevenueAgg[0]?.sum || 0,
        today: todayRevenueAgg[0]?.sum || 0,
        thisMonth: monthRevenueAgg[0]?.sum || 0,
      },
      orders: { total: totalOrders, today: todayOrders, pendingPayment: pendingOrders },
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      products: { total: totalProducts, lowStock: lowStockCount },
    },
    "خلاصه آمار داشبورد"
  ).send(res);
});

// ---------- ۲. نمودار فروش بر اساس بازه زمانی ----------
export const getSalesChart = asyncHandler(async (req, res) => {
  const { period = "daily", days = 30 } = req.query;

  const dateFormat = period === "monthly" ? "%Y-%m" : period === "weekly" ? "%G-W%V" : "%Y-%m-%d";
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(days));

  const data = await OrderMd.aggregate([
    { $match: { ...PAID_MATCH, createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  new ApiResponse(200, data, "نمودار فروش").send(res);
});

// ---------- ۳. پرفروش‌ترین محصولات ----------
export const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const data = await OrderMd.aggregate([
    { $match: PAID_MATCH },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: Number(limit) },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "product" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$product.name",
        slug: "$product.slug",
        images: "$product.images",
        totalSold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  new ApiResponse(200, data, "پرفروش‌ترین محصولات").send(res);
});

// ---------- ۴. تفکیک وضعیت سفارش‌ها ----------
export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const data = await OrderMd.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  new ApiResponse(200, data, "تفکیک وضعیت سفارش‌ها").send(res);
});

// ---------- ۵. فروش بر اساس دسته‌بندی ----------
export const getSalesByCategory = asyncHandler(async (req, res) => {
  const data = await OrderMd.aggregate([
    { $match: PAID_MATCH },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } },
    { $unwind: "product" },
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
    { $unwind: "category" },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  new ApiResponse(200, data, "فروش بر اساس دسته‌بندی").send(res);
});

// ---------- ۶. جدیدترین سفارش‌ها ----------
export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await OrderMd.find()
    .populate("user", "name phone")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  new ApiResponse(200, orders, "جدیدترین سفارش‌ها").send(res);
});

// ---------- ۷. محصولات با موجودی کم ----------
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;

  const products = await ProductMd.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: Number(threshold) } } },
    {
      $project: {
        name: 1,
        slug: 1,
        size: "$variants.size",
        color: "$variants.color",
        stock: "$variants.stock",
      },
    },
    { $sort: { stock: 1 } },
  ]);

  new ApiResponse(200, products, "محصولات با موجودی کم").send(res);
});

// ---------- ۸. مشتریان برتر (بیشترین خرید) ----------
export const getTopCustomers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const data = await OrderMd.aggregate([
    { $match: PAID_MATCH },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: Number(limit) },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "user" },
    { $project: { _id: 0, userId: "$_id", name: "$user.name", phone: "$user.phone", totalSpent: 1, ordersCount: 1 } },
  ]);

  new ApiResponse(200, data, "مشتریان برتر").send(res);
});