import axiosInstance from "./axiosInstance";

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

export const listProducts = (params) =>
  axiosInstance
    .get("/products/admin/list", { params: clean(params) })
    .then((res) => res.data.data);

export const getProduct = (id) =>
  axiosInstance.get(`/products/admin/${id}`).then((res) => res.data.data);

// خروجی کامل {message, data} تا پیام سرور تو توست نمایش داده بشه
export const createProduct = (body) =>
  axiosInstance.post("/products", body).then((res) => res.data);
export const updateProduct = (id, body) =>
  axiosInstance.patch(`/products/${id}`, body).then((res) => res.data);
export const deleteProduct = (id) =>
  axiosInstance.delete(`/products/${id}`).then((res) => res.data);
