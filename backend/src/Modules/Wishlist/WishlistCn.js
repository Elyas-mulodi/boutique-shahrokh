import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import WishlistMd from "./WishlistMd.js";
import ProductMd from "../Product/ProductMd.js";

async function getOrCreateWishlist(userId) {
  let wishlist = await WishlistMd.findOne({ user: userId });
  if (!wishlist) wishlist = await WishlistMd.create({ user: userId, products: [] });
  return wishlist;
}

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  await wishlist.populate("products", "name slug price images");

  new ApiResponse(200, wishlist, "لیست علاقه‌مندی‌ها").send(res);
});

export const addProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await ProductMd.findById(productId);
  if (!product) throw ApiError.notFound("محصول یافت نشد");

  const wishlist = await getOrCreateWishlist(req.user._id);

  const alreadyExists = wishlist.products.some((p) => p.toString() === productId);
  if (alreadyExists) throw ApiError.conflict("این محصول قبلا به لیست علاقه‌مندی‌ها اضافه شده است");

  wishlist.products.push(productId);
  await wishlist.save();

  new ApiResponse(200, wishlist, "به لیست علاقه‌مندی‌ها اضافه شد").send(res);
});

export const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();

  new ApiResponse(200, wishlist, "از لیست علاقه‌مندی‌ها حذف شد").send(res);
});