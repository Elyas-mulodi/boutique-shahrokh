import axiosInstance from "./axiosInstance";

export const createOrder = (data) => axiosInstance.post("/orders", data);
export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);
export const getMyOrders = () => axiosInstance.get("/orders/my");