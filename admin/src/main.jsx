import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store";
import { logout } from "./redux/slices/authSlice";
import { attachAuthInterceptor } from "./services/axiosInstance";
import ToastProvider from "./components/toast/ToastProvider";

attachAuthInterceptor(() => store.dispatch(logout()));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);