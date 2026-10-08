import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../services/cartApi";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.status);
  }
});

export const changeItemQuantity = createAsyncThunk("cart/changeQty", async ({ itemId, quantity }) => {
  const res = await cartApi.updateCartItem(itemId, quantity);
  return res.data.data;
});

export const removeItem = createAsyncThunk("cart/removeItem", async (itemId) => {
  const res = await cartApi.removeCartItem(itemId);
  return res.data.data;
});

export const emptyCart = createAsyncThunk("cart/clear", async () => {
  const res = await cartApi.clearCart();
  return res.data.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle", // idle | loading | succeeded | failed | unauthenticated
    mutatingItemId: null, // برای نشون‌دادن لودینگ روی یه آیتم خاص موقع تغییر تعداد/حذف
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = action.payload === 401 ? "unauthenticated" : "failed";
        state.items = [];
      })
      .addCase(changeItemQuantity.pending, (state, action) => {
        state.mutatingItemId = action.meta.arg.itemId;
      })
      .addCase(changeItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.mutatingItemId = null;
      })
      .addCase(changeItemQuantity.rejected, (state) => {
        state.mutatingItemId = null;
      })
      .addCase(removeItem.pending, (state, action) => {
        state.mutatingItemId = action.meta.arg;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.mutatingItemId = null;
      })
      .addCase(emptyCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;