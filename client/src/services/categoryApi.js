import axiosInstance from "./axiosInstance";

export const getCategoryTree = () => axiosInstance.get("/categories");
export const getCategoryBySlug = (slug) => axiosInstance.get(`/categories/${slug}`);