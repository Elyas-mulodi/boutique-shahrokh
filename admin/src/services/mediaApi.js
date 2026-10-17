import axiosInstance from "./axiosInstance";

// تایم‌اوت بیشتر برای آپلود چند تصویر
export const uploadProductImages = (files) => {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));

  return axiosInstance.post("/media/products", form, { timeout: 120000 }).then((res) => res.data.data.urls);
};