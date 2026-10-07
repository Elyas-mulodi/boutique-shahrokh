import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts, getBestSellers } from "../../services/productApi";

export const fetchLatestProducts = createAsyncThunk("products/fetchLatest", async () => {
  const res = await getProducts({ limit: 6, page: 1 });
  return res.data.data;
});

export const fetchBestSellers = createAsyncThunk("products/fetchBestSellers", async () => {
  const res = await getBestSellers(10);
  return res.data.data;
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    latest: [],
    latestStatus: "idle",
    latestError: null,
    bestSellers: [],
    bestSellersStatus: "idle",
    bestSellersError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestProducts.pending, (state) => {
        state.latestStatus = "loading";
        state.latestError = null;
      })
      .addCase(fetchLatestProducts.fulfilled, (state, action) => {
        state.latestStatus = "succeeded";
        state.latest = action.payload.products;
      })
      .addCase(fetchLatestProducts.rejected, (state, action) => {
        state.latestStatus = "failed";
        state.latestError = action.error.message;
        state.latest = [];
      })
      .addCase(fetchBestSellers.pending, (state) => {
        state.bestSellersStatus = "loading";
        state.bestSellersError = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellersStatus = "succeeded";
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.bestSellersStatus = "failed";
        state.bestSellersError = action.error.message;
        state.bestSellers = [];
      });
  },
});

export default productSlice.reducer;