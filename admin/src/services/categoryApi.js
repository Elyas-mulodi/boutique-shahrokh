import axiosInstance from "./axiosInstance";

export const listAllCategories = () =>
  axiosInstance.get("/categories/admin/list").then((res) => res.data.data);
