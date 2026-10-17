import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import CategoryMd from "./CategoryMd.js";
import ProductMd from "../Product/ProductMd.js";

export const adminList = asyncHandler(async (req, res) => {
  const [categories, productCounts] = await Promise.all([
    CategoryMd.find().sort({ createdAt: 1 }).lean(),
    ProductMd.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  const counts = new Map(productCounts.map((c) => [String(c._id), c.count]));
  const childCounts = new Map();
  categories.forEach((c) => {
    if (c.parent) childCounts.set(String(c.parent), (childCounts.get(String(c.parent)) || 0) + 1);
  });

  const data = categories.map((c) => ({
    ...c,
    productsCount: counts.get(String(c._id)) || 0,
    childrenCount: childCounts.get(String(c._id)) || 0,
  }));

  new ApiResponse(200, data, "لیست دسته‌بندی‌ها").send(res);
});

export const create = asyncHandler(async (req, res) => {
  const exists = await CategoryMd.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict("این slug قبلا استفاده شده است");

  const category = await CategoryMd.create(req.body);
  new ApiResponse(201, category, "دسته‌بندی ایجاد شد").send(res);
});

export const getTree = asyncHandler(async (req, res) => {
  const categories = await CategoryMd.find({ isActive: true }).lean();

  const map = {};
  categories.forEach((c) => (map[c._id] = { ...c, children: [] }));

  const tree = [];
  categories.forEach((c) => {
    if (c.parent) {
      map[c.parent]?.children.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });

  new ApiResponse(200, tree, "درخت دسته‌بندی‌ها").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  new ApiResponse(200, category, "دسته‌بندی بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const hasChildren = await CategoryMd.exists({ parent: req.params.id });
  if (hasChildren) throw ApiError.badRequest("ابتدا زیردسته‌های این دسته را حذف کنید");

  const category = await CategoryMd.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  new ApiResponse(200, null, "دسته‌بندی حذف شد").send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  const children = await CategoryMd.find({ parent: category._id, isActive: true }).lean();

  // مسیر والدها (از ریشه تا والد مستقیم) برای breadcrumb
  const ancestors = [];
  let current = category;
  let depth = 0;
  while (current.parent && depth < 10) {
    const parent = await CategoryMd.findById(current.parent).select("name slug parent").lean();
    if (!parent) break;
    ancestors.unshift({ _id: parent._id, name: parent.name, slug: parent.slug });
    current = parent;
    depth += 1;
  }

  new ApiResponse(200, { category, children, ancestors }, "دسته‌بندی").send(res);
});