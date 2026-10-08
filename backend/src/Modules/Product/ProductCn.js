import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import ProductMd from "./ProductMd.js";
import OrderMd from "../Order/OrderMd.js";
import CategoryMd from "../Category/CategoryMd.js";

async function getCategoryWithDescendantIds(categoryId) {
  const ids = [categoryId];
  let frontier = [categoryId];
  let depth = 0;

  while (frontier.length > 0 && depth < 10) {
    const children = await CategoryMd.find({ parent: { $in: frontier }, isActive: true })
      .select("_id")
      .lean();
    frontier = children.map((c) => c._id);
    ids.push(...frontier);
    depth += 1;
  }

  return ids;
}

export const create = asyncHandler(async (req, res) => {
  const exists = await ProductMd.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict("این slug قبلا استفاده شده است");

  const product = await ProductMd.create(req.body);
  new ApiResponse(201, product, "محصول ایجاد شد").send(res);
});

export const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = { $in: await getCategoryWithDescendantIds(category) };
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    ProductMd.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    ProductMd.countDocuments(filter),
  ]);

  new ApiResponse(
    200,
    { products, total, page: Number(page), pages: Math.ceil(total / limit) },
    "لیست محصولات"
  ).send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await ProductMd.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate("category", "name slug");
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  new ApiResponse(200, product, "جزئیات محصول").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const product = await ProductMd.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  new ApiResponse(200, product, "محصول بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const product = await ProductMd.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  new ApiResponse(200, null, "محصول حذف شد").send(res);
});

export const decreaseStock = async (productId, variantId, quantity) => {
  const product = await ProductMd.findOneAndUpdate(
    {
      _id: productId,
      "variants._id": variantId,
      "variants.stock": { $gte: quantity },
    },
    { $inc: { "variants.$.stock": -quantity } },
    { new: true }
  );
  if (!product) throw ApiError.badRequest("موجودی کافی نیست یا محصول/تنوع یافت نشد");
  return product;
};

export const getBestSellers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const data = await ProductMd.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "orders",
        let: { productId: "$_id" },
        pipeline: [
          { $match: { paymentStatus: "paid" } },
          { $unwind: "$items" },
          { $match: { $expr: { $eq: ["$items.product", "$$productId"] } } },
          { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
        ],
        as: "salesData",
      },
    },
    { $addFields: { totalSold: { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] } } },
    { $match: { totalSold: { $gt: 0 } } },
    { $sort: { totalSold: -1 } },
    { $limit: Number(limit) },
    { $project: { salesData: 0 } },
  ]);

  new ApiResponse(200, data, "پرفروش‌ترین محصولات").send(res);
});
