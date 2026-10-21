import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authApi from "../../services/authApi";
import { TOKEN_KEY } from "../../services/axiosInstance";
import { getErrorMessage } from "../../utils/error";

const USER_KEY = "admin_user";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

const clearSession = (state) => {
  state.token = null;
  state.user = null;
  state.verifyStatus = "idle";
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const loginAdmin = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await authApi.login(credentials);
    const { user, token } = res.data.data;
    if (user.role !== "admin") return rejectWithValue("دسترسی به پنل فقط برای مدیران است");
    return { user, token };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "خطا در ورود"));
  }
});

export const verifySession = createAsyncThunk("auth/verify", async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    const user = res.data.data;
    if (user.role !== "admin") return rejectWithValue("not_admin");
    return user;
  } catch (err) {
    const status = err?.response?.status;
    return rejectWithValue(status === 401 || status === 403 ? "unauthorized" : "network");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem(TOKEN_KEY),
    user: readUser(),
    status: "idle", 
    error: null,
    verifyStatus: "idle", 
  },
  reducers: {
    logout: (state) => {
      clearSession(state);
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.verifyStatus = "succeeded";
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload || "خطا در ورود";
      })
      .addCase(verifySession.pending, (state) => {
        state.verifyStatus = "loading";
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.verifyStatus = "succeeded";
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      })
      .addCase(verifySession.rejected, (state, action) => {
        if (action.payload === "not_admin") {
          clearSession(state);
          state.error = "دسترسی به پنل فقط برای مدیران است";
        } else if (action.payload === "unauthorized") {
          clearSession(state);
          state.error = "نشست شما منقضی شده است، دوباره وارد شوید";
        } else {
          state.verifyStatus = "failed"; 
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;