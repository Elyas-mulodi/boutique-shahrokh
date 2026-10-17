import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { escapeRegex, toPositiveInt } from "../../Utils/text.js";
import { removeUploadedFiles } from "../../Utils/files.js";
import ProductMd from "./ProductMd.js";
import CategoryMd from "../Category/CategoryMd.js";
import OrderMd from "../Order/OrderMd.js";
import CartMd from "../Cart/CartMd.js";

const LOW_STOCK_THRESHOLD = 5;

// خود دسته + همه زیردسته‌هاش (تا عمق ۱۰)
async function getCategoryWithDescendantIds(categoryId, { onlyActive = true } = {}) {
  const ids = [categoryId];
  let frontier = [categoryId];
  let depth = 0;

  while (frontier.length > 0 && depth < 10) {
    const children = await CategoryMd.find({
      parent: { $in: frontier },
      ...(onlyActive && { isActive: true }),
    })
      .select("_id")
      .lean();

    frontier = children.map((c) => c._id);
    ids.push(...frontier);
    depth += 1;
  }

  return ids;
}

// ---------- عمومی (فروشگاه) ----------
export const list = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 60);
  const { category, search, minPrice, maxPrice, sort } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = { $in: await getCategoryWithDescendantIds(category) };
  if (search) filter.$text = { $search: String(search) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1, _id: -1 };
  if (sort === "price_asc") sortOption = { price: 1, _id: 1 };
  else if (sort === "price_desc") sortOption = { price: -1, _id: -1 };

  const [products, total] = await Promise.all([
    ProductMd.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    ProductMd.countDocuments(filter),
  ]);

  new ApiResponse(
    200,
    { products, total, page, pages: Math.ceil(total / limit) },
    "لیست محصولات"
  ).send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await ProductMd.findOne({
    slug: String(req.params.slug).toLowerCase(),
    isActive: true,
  }).populate("category", "name slug");

  if (!product) throw ApiError.notFound("محصول یافت نشد");

  new ApiResponse(200, product, "جزئیات محصول").send(res);
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const limit = toPositiveInt(req.query.limit, 10, 30);

  // اول از روی سفارش‌ها گروه‌بندی میشه (سریع)، بعد محصول‌های فعال برداشته میشن
  const rows = await OrderMd.aggregate([
    { $match: { paymentStatus: "paid", status: { $ne: "canceled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
    { $sort: { totalSold: -1, _id: 1 } },
    { $limit: limit * 3 }, // حاشیه برای محصول‌های غیرفعال
  ]);

  const products = await ProductMd.find({
    _id: { $in: rows.map((r) => r._id) },
    isActive: true,
  });

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const data = rows
    .map((row) => byId.get(String(row._id)))
    .filter(Boolean)
    .slice(0, limit);

  new ApiResponse(200, data, "پرفروش‌ترین محصولات").send(res);
});

// ---------- ادمین ----------
const ADMIN_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 },
  name: { name: 1, _id: 1 },
};

export const adminList = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const { category, status = "all", stock = "all", sort = "newest" } = req.query;

  const filter = {};

  const term = String(req.query.search || "").trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    filter.$or = [{ name: regex }, { slug: regex }];
  }

  if (category) {
    filter.category = { $in: await getCategoryWithDescendantIds(category, { onlyActive: false }) };
  }

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  // هماهنگ با داشبورد: «کم» = تنوعی با ۱ تا ۵ عدد، «تمام‌شده» = تنوعی با موجودی ۰
  if (stock === "low") {
    filter.variants = { $elemMatch: { stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } } };
  } else if (stock === "out") {
    filter.variants = { $elemMatch: { stock: 0 } };
  }

  const [products, total] = await Promise.all([
    ProductMd.find(filter)
      .populate("category", "name slug")
      .sort(ADMIN_SORTS[sort] || ADMIN_SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    ProductMd.countDocuments(filter),
  ]);

  new ApiResponse(
    200,
    { products, total, page, pages: Math.ceil(total / limit) || 1 },
    "لیست محصولات"
  ).send(res);
});

export const adminGetById = asyncHandler(async (req, res) => {
  const product = await ProductMd.findById(req.params.id).populate("category", "name slug");
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  new ApiResponse(200, product, "جزئیات محصول").send(res);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const slug = body.slug.toLowerCase();

  if (await ProductMd.exists({ slug })) throw ApiError.conflict("این slug قبلا استفاده شده است");
  if (!(await CategoryMd.exists({ _id: body.category }))) {
    throw ApiError.badRequest("دسته‌بندی انتخاب‌شده یافت نشد");
  }

  const product = await ProductMd.create({
    ...body,
    slug,
    variants: body.variants.map(({ _id, ...variant }) => variant),
  });

  new ApiResponse(201, product, "محصول ایجاد شد").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const product = await ProductMd.findById(req.params.id);
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  const body = { ...req.body };

  if (body.slug !== undefined) {
    body.slug = body.slug.toLowerCase();
    const conflict =
      body.slug !== product.slug &&
      (await ProductMd.exists({ slug: body.slug, _id: { $ne: product._id } }));
    if (conflict) throw ApiError.conflict("این slug قبلا استفاده شده است");
  }

  if (body.category && String(body.category) !== String(product.category)) {
    if (!(await CategoryMd.exists({ _id: body.category }))) {
      throw ApiError.badRequest("دسته‌بندی انتخاب‌شده یافت نشد");
    }
  }

  if (body.variants) {
    // تنوع‌های موجود شناسه‌شون رو حفظ می‌کنن (سبدها بهشون ارجاع دارن)؛
    // موجودی فرستاده‌نشده = موجودی فعلی دیتابیس (جلوگیری از بازنویسی خریدهای همزمان)
    const existing = new Map(product.variants.map((v) => [String(v._id), v]));

    body.variants = body.variants.map((incoming) => {
      const { _id, stock, ...rest } = incoming;
      const current = _id ? existing.get(String(_id)) : null;

      if (current) return { _id: current._id, ...rest, stock: stock ?? current.stock };
      if (stock === undefined) throw ApiError.badRequest("موجودی تنوع جدید الزامی است");
      return { ...rest, stock };
    });
  }

  const oldImages = [...product.images];

  product.set(body);
  await product.save();

  // تصاویری که از محصول برداشته شدن از روی دیسک پاک میشن
  if (body.images) {
    const kept = new Set(product.images);
    await removeUploadedFiles(oldImages.filter((url) => !kept.has(url)));
  }

  await product.populate("category", "name slug");
  new ApiResponse(200, product, "محصول بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const product = await ProductMd.findById(req.params.id);
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  const hasPaidOrders = await OrderMd.exists({ paymentStatus: "paid", "items.product": product._id });
  if (hasPaidOrders) {
    throw ApiError.conflict(
      "این محصول در سفارش‌های پرداخت‌شده ثبت شده و قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید"
    );
  }

  await product.deleteOne();
  await CartMd.updateMany({ "items.product": product._id }, { $pull: { items: { product: product._id } } });
  await removeUploadedFiles(product.images);

  new ApiResponse(200, null, "محصول حذف شد").send(res);
});