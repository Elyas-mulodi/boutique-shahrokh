import axiosInstance from "./axiosInstance";

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));

export const listOrders = (params) =>
  axiosInstance.get("/orders", { params: clean(params) }).then((res) => res.data.data);

export const getOrder = (id) => axiosInstance.get(`/orders/${id}`).then((res) => res.data.data);

export const updateOrderStatus = (id, body) =>
  axiosInstance.patch(`/orders/${id}/status`, body).then((res) => res.data);

export const resolveStockIssue = (id) =>
  axiosInstance.post(`/orders/${id}/resolve-stock`).then((res) => res.data);