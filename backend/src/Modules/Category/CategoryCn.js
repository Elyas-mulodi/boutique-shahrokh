import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { removeUploadedFiles } from "../../Utils/files.js";
import CategoryMd from "./CategoryMd.js";
import ProductMd from "../Product/ProductMd.js";

// حداکثر عمق درخت (ریشه = سطح ۱). باید با MAX_CATEGORY_DEPTH پنل یکی باشد
const MAX_DEPTH = 3;

// ترتیب نمایش: sortOrder، بعد زمان ساخت (دسته‌های قدیمی بدون sortOrder مقدار ۰ حساب میشن)
const byOrder = (a, b) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
  new Date(a.createdAt) - new Date(b.createdAt) ||
  String(a._id).localeCompare(String(b._id));

// ---------- ابزارهای درخت (کل دسته‌ها کم‌حجمه و یک‌جا تو حافظه بررسی میشن) ----------
async function loadIndex() {
  const all = await CategoryMd.find().select("parent").lean();
  const byId = new Map(all.map((c) => [String(c._id), c]));
  const childrenOf = new Map();

  all.forEach((c) => {
    if (!c.parent) return;
    const key = String(c.parent);
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key).push(String(c._id));
  });

  return { byId, childrenOf };
}

function depthOf({ byId }, id) {
  let depth = 1;
  let current = byId.get(String(id));
  let guard = 0;

  while (current?.parent && byId.has(String(current.parent)) && guard < 20) {
    depth += 1;
    current = byId.get(String(current.parent));
    guard += 1;
  }
  return depth;
}

function heightOf({ childrenOf }, id) {
  let max = 1;
  const stack = [[String(id), 1]];
  const seen = new Set();

  while (stack.length) {
    const [key, level] = stack.pop();
    if (seen.has(key)) continue;
    seen.add(key);
    max = Math.max(max, level);
    (childrenOf.get(key) || []).forEach((child) => stack.push([child, level + 1]));
  }
  return max;
}

function descendantsOf({ childrenOf }, id) {
  const result = new Set();
  const stack = [String(id)];

  while (stack.length) {
    const key = stack.pop();
    (childrenOf.get(key) || []).forEach((child) => {
      if (!result.has(child)) {
        result.add(child);
        stack.push(child);
      }
    });
  }
  return result;
}

// categoryId = null یعنی دسته‌ی جدید
function assertValidParent(index, categoryId, parentId) {
  if (!index.byId.has(String(parentId))) throw ApiError.badRequest("دسته‌بندی والد یافت نشد");

  if (categoryId) {
    if (String(parentId) === String(categoryId)) {
      throw ApiError.badRequest("دسته‌بندی نمی‌تواند والد خودش باشد");
    }
    if (descendantsOf(index, categoryId).has(String(parentId))) {
      throw ApiError.badRequest("والد انتخاب‌شده زیرمجموعه‌ی همین دسته‌بندی است");
    }
  }

  const height = categoryId ? heightOf(index, categoryId) : 1;
  if (depthOf(index, parentId) + height > MAX_DEPTH) {
    throw ApiError.badRequest(`حداکثر عمق دسته‌بندی ${MAX_DEPTH.toLocaleString("fa-IR")} سطح است`);
  }
}

// آخرین جایگاه بین دسته‌های هم‌سطح
async function nextSortOrder(parent) {
  const siblings = await CategoryMd.find({ parent: parent || null })
    .select("sortOrder")
    .lean();
  return siblings.reduce((max, s) => Math.max(max, s.sortOrder ?? 0), -1) + 1;
}

// ---------- عمومی (فروشگاه) ----------
export const getTree = asyncHandler(async (req, res) => {
  const categories = (await CategoryMd.find({ isActive: true }).lean()).sort(byOrder);

  const nodes = new Map(categories.map((c) => [String(c._id), { ...c, children: [] }]));
  const tree = [];

  categories.forEach((c) => {
    const node = nodes.get(String(c._id));
    if (c.parent)
      nodes.get(String(c.parent))?.children.push(node); // زیردسته‌ی والد غیرفعال نمایش داده نمیشه
    else tree.push(node);
  });

  new ApiResponse(200, tree, "درخت دسته‌بندی‌ها").send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findOne({
    slug: String(req.params.slug).toLowerCase(),
    isActive: true,
  }).lean();
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  // مسیر والدها (از ریشه تا والد مستقیم)؛ اگه والدی غیرفعال باشه این دسته هم تو فروشگاه نیست
  const ancestors = [];
  let current = category;
  let guard = 0;

  while (current.parent && guard < 10) {
    const parent = await CategoryMd.findById(current.parent)
      .select("name slug parent isActive")
      .lean();
    if (!parent) break;
    if (!parent.isActive) throw ApiError.notFound("دسته‌بندی یافت نشد");

    ancestors.unshift({ _id: parent._id, name: parent.name, slug: parent.slug });
    current = parent;
    guard += 1;
  }

  const children = (await CategoryMd.find({ parent: category._id, isActive: true }).lean()).sort(
    byOrder
  );

  new ApiResponse(200, { category, children, ancestors }, "دسته‌بندی").send(res);
});

// ---------- ادمین ----------
export const adminList = asyncHandler(async (req, res) => {
  const [categories, productCounts] = await Promise.all([
    CategoryMd.find().lean(),
    ProductMd.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  const counts = new Map(productCounts.map((c) => [String(c._id), c.count]));
  const childCounts = new Map();
  categories.forEach((c) => {
    if (c.parent) childCounts.set(String(c.parent), (childCounts.get(String(c.parent)) || 0) + 1);
  });

  const data = categories.sort(byOrder).map((c) => ({
    ...c,
    productsCount: counts.get(String(c._id)) || 0,
    childrenCount: childCounts.get(String(c._id)) || 0,
  }));

  new ApiResponse(200, data, "لیست دسته‌بندی‌ها").send(res);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const slug = body.slug.toLowerCase();
  const parent = body.parent || null;

  if (await CategoryMd.exists({ slug })) throw ApiError.conflict("این slug قبلا استفاده شده است");
  if (parent) assertValidParent(await loadIndex(), null, parent);

  const category = await CategoryMd.create({
    name: body.name,
    slug,
    parent,
    image: body.image || null,
    isActive: body.isActive ?? true,
    sortOrder: await nextSortOrder(parent),
  });

  new ApiResponse(201, category, "دسته‌بندی ایجاد شد").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findById(req.params.id);
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  const body = { ...req.body };

  if (body.slug !== undefined) {
    body.slug = body.slug.toLowerCase();
    const conflict =
      body.slug !== category.slug &&
      (await CategoryMd.exists({ slug: body.slug, _id: { $ne: category._id } }));
    if (conflict) throw ApiError.conflict("این slug قبلا استفاده شده است");
  }

  if (body.parent !== undefined) {
    const newParent = body.parent || null;

    if (String(newParent || "") !== String(category.parent || "")) {
      if (newParent) assertValidParent(await loadIndex(), category._id, newParent);
      body.sortOrder = await nextSortOrder(newParent); // به انتهای والد جدید میره
    }
    body.parent = newParent;
  }

  const oldImage = category.image;

  category.set(body);
  await category.save();

  if (body.image !== undefined && oldImage && oldImage !== category.image) {
    await removeUploadedFiles([oldImage]);
  }

  new ApiResponse(200, category, "دسته‌بندی بروزرسانی شد").send(res);
});

// جابه‌جایی یک پله بین دسته‌های هم‌سطح؛ ترتیب همه‌ی هم‌سطح‌ها یکدست (۰ تا n-1) ذخیره میشه
export const move = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findById(req.params.id).select("parent");
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  const siblings = (
    await CategoryMd.find({ parent: category.parent || null })
      .select("sortOrder createdAt")
      .lean()
  ).sort(byOrder);

  const index = siblings.findIndex((s) => String(s._id) === String(category._id));
  const target = req.body.direction === "up" ? index - 1 : index + 1;

  if (index === -1 || target < 0 || target >= siblings.length) {
    return new ApiResponse(200, null, "ترتیب تغییری نکرد").send(res);
  }

  [siblings[index], siblings[target]] = [siblings[target], siblings[index]];

  await CategoryMd.bulkWrite(
    siblings.map((s, i) => ({
      updateOne: { filter: { _id: s._id }, update: { $set: { sortOrder: i } } },
    }))
  );

  return new ApiResponse(200, null, "ترتیب بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const category = await CategoryMd.findById(req.params.id);
  if (!category) throw ApiError.notFound("دسته‌بندی یافت نشد");

  const [hasChildren, productsCount] = await Promise.all([
    CategoryMd.exists({ parent: category._id }),
    ProductMd.countDocuments({ category: category._id }),
  ]);

  if (hasChildren) throw ApiError.conflict("ابتدا زیردسته‌های این دسته‌بندی را حذف یا منتقل کنید");
  if (productsCount > 0) {
    throw ApiError.conflict(
      `${productsCount.toLocaleString("fa-IR")} محصول در این دسته‌بندی قرار دارد؛ ابتدا آن‌ها را به دسته‌بندی دیگری منتقل کنید`
    );
  }

  await category.deleteOne();
  await removeUploadedFiles([category.image]);

  new ApiResponse(200, null, "دسته‌بندی حذف شد").send(res);
});
