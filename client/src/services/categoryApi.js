import axiosInstance from "./axiosInstance";

export const getCategoryTree = () => axiosInstance.get("/categories");