import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import { removeUploadedFiles } from "../../Utils/files.js";
import BannerMd, { BANNER_PLACEMENTS } from "./BannerMd.js";

const imagesOf = (banner) => [banner.image, banner.imageMobile].filter(Boolean);

// فقط عکس‌هایی پاک میشن که هیچ بنر دیگه‌ای هنوز ازشون استفاده نمی‌کنه
async function removeUnusedImages(urls, excludeId) {
  if (urls.length === 0) return;

  const stillUsing = await BannerMd.find({
    _id: { $ne: excludeId },
    $or: [{ image: { $in: urls } }, { imageMobile: { $in: urls } }],
  })
    .select("image imageMobile")
    .lean();

  const used = new Set(stillUsing.flatMap(imagesOf));
  await removeUploadedFiles(urls.filter((url) => !used.has(url)));
}

// ---------- عمومی (فروشگاه) ----------
// GET /banners?placement=hero  → فقط بنرهای فعال و داخل بازه‌ی زمان‌بندی
export const list = asyncHandler(async (req, res) => {
  const { placement } = req.query;
  if (placement !== undefined && !BANNER_PLACEMENTS.includes(placement)) {
    throw ApiError.badRequest("جایگاه بنر نامعتبر است");
  }

  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
    ...(placement && { placement }),
  };

  const banners = await BannerMd.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .select("-isActive -startsAt -endsAt -createdAt -updatedAt -__v")
    .lean();

  new ApiResponse(200, banners, "لیست بنرها").send(res);
});

// ---------- ادمین ----------
export const adminList = asyncHandler(async (req, res) => {
  const { placement } = req.query;
  if (placement !== undefined && !BANNER_PLACEMENTS.includes(placement)) {
    throw ApiError.badRequest("جایگاه بنر نامعتبر است");
  }

  const banners = await BannerMd.find(placement ? { placement } : {}).sort({
    placement: 1,
    order: 1,
    createdAt: -1,
  });

  new ApiResponse(200, banners, "لیست بنرها").send(res);
});

export const adminGetById = asyncHandler(async (req, res) => {
  const banner = await BannerMd.findById(req.params.id);
  if (!banner) throw ApiError.notFound("بنر یافت نشد");

  new ApiResponse(200, banner, "جزئیات بنر").send(res);
});

export const create = asyncHandler(async (req, res) => {
  const banner = await BannerMd.create(req.body);

  new ApiResponse(201, banner, "بنر ایجاد شد").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const banner = await BannerMd.findById(req.params.id);
  if (!banner) throw ApiError.notFound("بنر یافت نشد");

  const oldImages = imagesOf(banner);

  banner.set(req.body);
  await banner.save();

  const kept = new Set(imagesOf(banner));
  await removeUnusedImages(
    oldImages.filter((url) => !kept.has(url)),
    banner._id
  );

  new ApiResponse(200, banner, "بنر بروزرسانی شد").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  const banner = await BannerMd.findById(req.params.id);
  if (!banner) throw ApiError.notFound("بنر یافت نشد");

  await banner.deleteOne();
  await removeUnusedImages(imagesOf(banner), banner._id);

  new ApiResponse(200, null, "بنر حذف شد").send(res);
});