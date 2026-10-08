import axiosInstance from "./axiosInstance";

export const getMe = () => axiosInstance.get("/users/me");
export const updateMe = (data) => axiosInstance.patch("/users/me", data);
export const saveAddress = (data) => axiosInstance.patch("/users/me/address", data);
export const changePassword = (data) => axiosInstance.patch("/users/me/password", data);