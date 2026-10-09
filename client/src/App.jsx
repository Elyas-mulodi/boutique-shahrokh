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
import NotFoundPage from "./pages/Info/NotFoundPage";
import PrivacyPage from "./pages/Info/PrivacyPage";
import TermsPage from "./pages/Info/TermsPage";
import FaqPage from "./pages/Info/FaqPage";
import AboutPage from "./pages/Info/AboutPage";
import ShippingPage from "./pages/Info/ShippingPage";
import ContactPage from "./pages/Info/ContactPage";

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
          <Route
            path="/contact"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <ContactPage />
              </div>
            }
          />
          <Route
            path="/shipping"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <ShippingPage />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <AboutPage />
              </div>
            }
          />
          <Route
            path="/faq"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <FaqPage />
              </div>
            }
          />
          <Route
            path="/terms"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <TermsPage />
              </div>
            }
          />
          <Route
            path="/privacy"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <PrivacyPage />
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <NotFoundPage />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
