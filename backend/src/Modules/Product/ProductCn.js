import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import ProductMd from "./ProductMd.js";

export const create = asyncHandler(async (req, res) => {
  const exists = await ProductMd.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict("این slug قبلا استفاده شده است");

  const product = await ProductMd.create(req.body);
  new ApiResponse(201, product, "محصول ایجاد شد").send(res);
});

export const list = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    minPrice,
    maxPrice,
  } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    ProductMd.find(filter)
      .populate("category", "name slug")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    ProductMd.countDocuments(filter),
  ]);

  new ApiResponse(
    200,
    { products, total, page: Number(page), pages: Math.ceil(total / limit) },
    "لیست محصولات",
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
    { new: true },
  );
  if (!product)
    throw ApiError.badRequest("موجودی کافی نیست یا محصول/تنوع یافت نشد");
  return product;
};
