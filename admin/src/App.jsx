import { Routes, Route } from "react-router-dom";
import AdminGuard from "./routes/AdminGuard";
import AdminLayout from "./components/layout/AdminLayout";
import ScrollToTop from "./components/layout/ScrollToTop";
import LoginPage from "./pages/Login/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import OrderDetailPage from "./pages/Orders/OrderDetailPage";
import OrderPrintPage from "./pages/Orders/OrderPrintPage";
import ComingSoonPage from "./pages/Placeholder/ComingSoonPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductCreatePage from "./pages/Products/ProductCreatePage";
import ProductEditPage from "./pages/Products/ProductEditPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import UserDetailPage from "./pages/Users/UserDetailPage";
import UsersPage from "./pages/Users/UsersPage";
import CouponsPage from "./pages/Coupons/CouponsPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AdminGuard />}>
          {/* چاپ: بدون سایدبار */}
          <Route path="orders/:id/print/:type" element={<OrderPrintPage />} />

          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />{" "}
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
