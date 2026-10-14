import axiosInstance from "./axiosInstance";

const get = (path, params) =>
  axiosInstance.get(`/dashboard/${path}`, { params }).then((res) => res.data.data);

export const getOverview = () => get("overview");
export const getSalesChart = (days) => get("sales-chart", { days });
export const getTopProducts = (params) => get("top-products", params);
export const getOrderStatus = (days) => get("order-status", { days });
export const getSalesByCategory = (days) => get("sales-by-category", { days });
export const getSalesByProvince = (days) => get("sales-by-province", { days });
export const getRecentOrders = (limit = 8) => get("recent-orders", { limit });
export const getLowStock = (threshold) => get("low-stock", { threshold });
export const getTopCustomers = (params) => get("top-customers", params);