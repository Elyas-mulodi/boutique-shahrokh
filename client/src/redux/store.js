import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import bannerReducer from "./slices/bannerSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    products: productReducer,
    auth: authReducer,
    cart: cartReducer,
    banners: bannerReducer,
  },
});
