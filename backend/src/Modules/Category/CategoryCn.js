import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import CategoryMd from "./CategoryMd.js";

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