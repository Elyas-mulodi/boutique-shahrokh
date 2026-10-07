import axiosInstance from "./axiosInstance";

export const addToCart = (data) => axiosInstance.post("/cart/items", data);