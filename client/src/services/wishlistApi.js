import axiosInstance from "./axiosInstance";

export const getWishlist = () => axiosInstance.get("/wishlist");
export const addToWishlist = (productId) => axiosInstance.post("/wishlist", { productId });
export const removeFromWishlist = (productId) => axiosInstance.delete(`/wishlist/${productId}`);