import axiosInstance from "./axiosInstance";

export const getCart = () => axiosInstance.get("/cart");
export const addToCart = (data) => axiosInstance.post("/cart/items", data);
export const updateCartItem = (itemId, quantity) => axiosInstance.patch(`/cart/items/${itemId}`, { quantity });
export const removeCartItem = (itemId) => axiosInstance.delete(`/cart/items/${itemId}`);
export const clearCart = () => axiosInstance.delete("/cart");