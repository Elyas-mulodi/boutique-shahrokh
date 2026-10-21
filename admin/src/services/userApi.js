import axiosInstance from "./axiosInstance";

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

export const listUsers = (params) =>
  axiosInstance
    .get("/users", { params: clean(params) })
    .then((res) => res.data.data);

export const getUserDetail = (id) =>
  axiosInstance.get(`/users/${id}`).then((res) => res.data.data);

export const setUserBlocked = (id, blocked) =>
  axiosInstance
    .patch(`/users/${id}/block`, { blocked })
    .then((res) => res.data);
