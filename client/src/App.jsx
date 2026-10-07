import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import ProductListPage from "./pages/ProductList/ProductListPage";
import Footer from "./components/Footer";
import ProductDetailPage from "./pages/ProductDetail/ProductDetailPage";

function App() {
  return (
    <div className="bg-paper min-h-screen">
      {" "}
      <Header />
      <main>
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
                <Cart />
              </div>
            }
          />
          <Route
            path="/account"
            element={
              <div className="max-w-7xl mx-auto px-4">
                <Account />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
