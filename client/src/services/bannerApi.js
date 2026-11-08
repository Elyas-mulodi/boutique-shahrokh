// اگه ایمپورت axios فرق داره، همونی که productSlice استفاده می‌کنه رو بذار
import axiosInstance from "./axiosInstance";

export const getBanners = (placement) =>
  axiosInstance.get("/banners", { params: { placement } }).then((res) => res.data.data);