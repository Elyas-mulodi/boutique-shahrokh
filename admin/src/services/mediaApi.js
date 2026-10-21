import axiosInstance from "./axiosInstance";

export const uploadProductImages = (files) => {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));

  return axiosInstance.post("/media/products", form, { timeout: 120000 }).then((res) => res.data.data.urls);
};

export const uploadCategoryImage = (file) => {
  const form = new FormData();
  form.append("image", file);

  return axiosInstance.post("/media/categories", form, { timeout: 60000 }).then((res) => res.data.data.url);
};