import axiosInstance from "./axiosInstance";

export const login = (data) => axiosInstance.post("/auth/login", data);
export const getMe = () => axiosInstance.get("/users/me");