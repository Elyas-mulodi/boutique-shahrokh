import axiosInstance from "./axiosInstance";

export const loginRequest = (data) => axiosInstance.post("/auth/login", data);
export const registerRequest = (data) => axiosInstance.post("/auth/register", data);
export const forgotPasswordRequest = (data) => axiosInstance.post("/auth/forgot-password", data);
export const resetPasswordRequest = (data) => axiosInstance.post("/auth/reset-password", data);