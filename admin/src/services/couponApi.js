import axiosInstance from "./axiosInstance";

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

export const listCoupons = (params) =>
  axiosInstance
    .get("/coupons", { params: clean(params) })
    .then((res) => res.data.data);

export const createCoupon = (body) =>
  axiosInstance.post("/coupons", body).then((res) => res.data);
export const updateCoupon = (id, body) =>
  axiosInstance.patch(`/coupons/${id}`, body).then((res) => res.data);
export const deleteCoupon = (id) =>
  axiosInstance.delete(`/coupons/${id}`).then((res) => res.data);
