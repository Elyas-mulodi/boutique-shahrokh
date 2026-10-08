import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductListPage from "./pages/ProductList/ProductListPage";
import Footer from "./components/Footer";
import ProductDetailPage from "./pages/ProductDetail/ProductDetailPage";
import AuthPage from "./pages/Auth/AuthPage";
import ScrollToTop from "./components/ScrollToTop";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import PaymentFailed from "./pages/Payment/PaymentFailed";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import Header from "./components/Header/Header";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import CategoryPage from "./pages/Category/CategoryPage";

function App() {
  return (
    <div className="bg-paper min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/category/:slug"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <CategoryPage />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <CartPage />
              </div>
            }
          />
          <Route
            path="/account"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <AuthPage />
              </div>
            }
          />
          <Route
            path="/products"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <ProductListPage />
              </div>
            }
          />
          <Route
            path="/product/:slug"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <ProductDetailPage />
              </div>
            }
          />
          <Route
            path="/payment/success"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <PaymentSuccess />
              </div>
            }
          />
          <Route
            path="/payment/failed"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <PaymentFailed />
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4">
                  <CheckoutPage />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
