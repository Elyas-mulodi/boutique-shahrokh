import axiosInstance from "./axiosInstance";

export const getProducts = (params) => axiosInstance.get("/products", { params });
export const getProductBySlug = (slug) => axiosInstance.get(`/products/${slug}`);
export const getBestSellers = (limit = 10) => axiosInstance.get("/products/best-sellers", { params: { limit } });