import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCategoryTree } from "../../services/categoryApi";

export const fetchCategories = createAsyncThunk("categories/fetch", async () => {
  const res = await getCategoryTree();
  return res.data.data; // بر اساس ApiResponse بک‌اند
});

const categorySlice = createSlice({
  name: "categories",
  initialState: { items: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default categorySlice.reducer;