import axios from "axios";

export const TOKEN_KEY = "admin_token";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 20000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// با ۴۰۱ (توکن نامعتبر یا منقضی) از پنل خارج میشیم؛ ورود ناموفق مستثنیه
export function attachAuthInterceptor(onUnauthorized) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (error.response?.status === 401 && !isLoginRequest) onUnauthorized();
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;