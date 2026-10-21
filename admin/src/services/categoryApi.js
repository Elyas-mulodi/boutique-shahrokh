import axiosInstance from "./axiosInstance";

export const listAllCategories = () =>
  axiosInstance.get("/categories/admin/list").then((res) => res.data.data);

export const createCategory = (body) =>
  axiosInstance.post("/categories", body).then((res) => res.data);
export const updateCategory = (id, body) =>
  axiosInstance.patch(`/categories/${id}`, body).then((res) => res.data);
export const deleteCategory = (id) =>
  axiosInstance.delete(`/categories/${id}`).then((res) => res.data);
export const moveCategory = (id, direction) =>
  axiosInstance
    .post(`/categories/${id}/move`, { direction })
    .then((res) => res.data);
