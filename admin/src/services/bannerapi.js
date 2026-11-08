import axiosInstance from "./axiosInstance";

export const listAllBanners = (params) =>
  axiosInstance.get("/banners/admin/list", { params }).then((res) => res.data.data);

export const getBanner = (id) =>
  axiosInstance.get(`/banners/admin/${id}`).then((res) => res.data.data);

export const createBanner = (body) =>
  axiosInstance.post("/banners", body).then((res) => res.data);
export const updateBanner = (id, body) =>
  axiosInstance.patch(`/banners/${id}`, body).then((res) => res.data);
export const deleteBanner = (id) =>
  axiosInstance.delete(`/banners/${id}`).then((res) => res.data);