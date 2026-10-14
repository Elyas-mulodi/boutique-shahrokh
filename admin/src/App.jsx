import { Routes, Route } from "react-router-dom";
import AdminGuard from "./routes/AdminGuard";
import AdminLayout from "./components/layout/AdminLayout";
import ScrollToTop from "./components/layout/ScrollToTop";
import LoginPage from "./pages/Login/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ComingSoonPage from "./pages/Placeholder/ComingSoonPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ReportsPage from "./pages/Reports/ReportsPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />{" "}
            <Route
              path="orders"
              element={<ComingSoonPage title="سفارش‌ها" />}
            />
            <Route
              path="products"
              element={<ComingSoonPage title="محصولات" />}
            />
            <Route
              path="categories"
              element={<ComingSoonPage title="دسته‌بندی‌ها" />}
            />
            <Route path="users" element={<ComingSoonPage title="کاربران" />} />
            <Route
              path="coupons"
              element={<ComingSoonPage title="کدهای تخفیف" />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
