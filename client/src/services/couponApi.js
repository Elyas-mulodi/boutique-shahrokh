import axiosInstance from "./axiosInstance";

export const previewCoupon = (code) => axiosInstance.post("/coupons/preview", { code });