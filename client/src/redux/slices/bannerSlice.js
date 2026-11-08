import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getBanners } from "../../services/bannerApi";

export const EMPTY_BANNERS = { items: [], status: "idle", error: null };

export const fetchBanners = createAsyncThunk("banners/fetch", async (placement, { rejectWithValue }) => {
  try {
    return { placement, items: await getBanners(placement) };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "خطا در دریافت بنرها");
  }
});

const bannerSlice = createSlice({
  name: "banners",
  initialState: { byPlacement: {} }, // { hero: { items, status, error }, promo: {...} }
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state, action) => {
        const placement = action.meta.arg;
        const current = state.byPlacement[placement] || EMPTY_BANNERS;
        state.byPlacement[placement] = { ...current, status: "loading", error: null };
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        const { placement, items } = action.payload;
        state.byPlacement[placement] = { items, status: "succeeded", error: null };
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        const placement = action.meta.arg;
        const current = state.byPlacement[placement] || EMPTY_BANNERS;
        state.byPlacement[placement] = {
          items: current.items,
          status: "failed",
          error: action.payload || "خطا در دریافت بنرها",
        };
      });
  },
});

export default bannerSlice.reducer;