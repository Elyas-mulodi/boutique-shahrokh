import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Account from "./pages/Account";

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
        </Routes>
      </main>
    </div>
  );
}

export default App;
