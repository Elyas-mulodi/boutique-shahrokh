import asyncHandler from "../../Utils/asyncHandler.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import ApiError from "../../Utils/ApiError.js";
import CartMd from "./CartMd.js";
import ProductMd from "../Product/ProductMd.js";

async function getOrCreateCart(userId) {
  let cart = await CartMd.findOne({ user: userId });
  if (!cart) cart = await CartMd.create({ user: userId, items: [] });
  return cart;
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product", "name images slug");

  new ApiResponse(200, cart, "سبد خرید").send(res);
});

export const addItem = asyncHandler(async (req, res) => {
  const { product: productId, variantId, quantity } = req.body;

  const product = await ProductMd.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound("محصول یافت نشد");

  const variant = product.variants.id(variantId);
  if (!variant) throw ApiError.notFound("این ترکیب سایز/رنگ یافت نشد");
  if (variant.stock < quantity) throw ApiError.badRequest("موجودی کافی نیست");

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((i) => i.variantId.toString() === variantId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex || null,
      quantity,
      price: product.price,
    });
  }

  await cart.save();
  new ApiResponse(200, cart, "به سبد خرید اضافه شد").send(res);
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound("آیتم در سبد یافت نشد");

  item.quantity = req.body.quantity;
  await cart.save();

  new ApiResponse(200, cart, "سبد خرید بروزرسانی شد").send(res);
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items.id(req.params.itemId)?.deleteOne();
  await cart.save();

  new ApiResponse(200, cart, "آیتم حذف شد").send(res);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  new ApiResponse(200, cart, "سبد خرید خالی شد").send(res);
});
