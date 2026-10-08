import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { fetchCart, resetCart } from "../../redux/slices/cartSlice";
import { logout } from "../../redux/slices/authSlice";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

function NavItem({ to, children, ...rest }) {
  return (
    <NavLink to={to} className="relative group py-2" {...rest}>
      {({ isActive }) => (
        <>
          <span
            className={`text-sm font-body transition-colors duration-200 ${
              isActive ? "text-blue" : "text-ink group-hover:text-blue"
            }`}
          >
            {children}
          </span>
          <span
            className={`absolute bottom-0 right-0 left-0 h-[1.5px] bg-blue origin-center transition-transform duration-300 ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const closeTimer = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { items: categories, status: categoriesStatus } = useSelector((state) => state.categories);
  const { token, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const onCategoryRoute = location.pathname.startsWith("/category");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // سبد خرید رو با وضعیت لاگین هماهنگ نگه می‌داریم (برای بج تعداد)
  useEffect(() => {
    if (token) dispatch(fetchCart());
    else dispatch(resetCart());
  }, [token, dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // بستن همه منوها با تغییر مسیر
  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // بستن با Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMegaOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-paper/95 backdrop-blur-md border-b border-ink/10">
        <div className="relative" onMouseLeave={scheduleCloseMega}>
          <motion.div
            animate={{ height: scrolled ? 64 : 84 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`max-w-7xl mx-auto px-4 flex items-center justify-between ${scrolled ? "shadow-sm" : ""}`}
          >
            {/* همبرگر + لوگو */}
            <div className="flex items-center gap-3" onMouseEnter={() => setMegaOpen(false)}>
              <button
                className="md:hidden text-ink"
                onClick={() => setMenuOpen(true)}
                aria-label="باز کردن منو"
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="font-heading text-ink text-lg md:text-2xl">
                بوتیک شاهرخ
              </Link>
            </div>

            {/* ناوبری دسکتاپ */}
            <nav className="hidden md:flex items-center gap-8">
              <NavItem to="/products" onMouseEnter={() => setMegaOpen(false)}>
                محصولات
              </NavItem>

              <button
                type="button"
                onMouseEnter={openMega}
                onFocus={openMega}
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                className="relative group py-2 flex items-center gap-1"
              >
                <span
                  className={`text-sm font-body transition-colors duration-200 ${
                    megaOpen || onCategoryRoute ? "text-blue" : "text-ink group-hover:text-blue"
                  }`}
                >
                  دسته‌بندی‌ها
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    megaOpen ? "rotate-180 text-blue" : "text-ink/60"
                  }`}
                />
                <span
                  className={`absolute bottom-0 right-0 left-0 h-[1.5px] bg-blue origin-center transition-transform duration-300 ${
                    megaOpen || onCategoryRoute ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>

              <NavItem to="/contact" onMouseEnter={() => setMegaOpen(false)}>
                پشتیبانی
              </NavItem>
            </nav>

            {/* آیکون‌ها */}
            <div className="flex items-center gap-5" onMouseEnter={() => setMegaOpen(false)}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="جستجو"
                className="text-ink hover:text-blue transition-colors"
              >
                {searchOpen ? <X size={22} /> : <Search size={22} />}
              </motion.button>

              <div className="hidden md:block">
                <UserMenu onLogout={handleLogout} />
              </div>

              <Link
                to="/cart"
                aria-label="سبد خرید"
                className="relative text-ink hover:text-blue transition-colors"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -top-1.5 -left-1.5 bg-blue text-paper text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount.toLocaleString("fa-IR")}
                  </motion.span>
                )}
              </Link>
            </div>
          </motion.div>

          {/* مگا منو */}
          <AnimatePresence>
            {megaOpen && (
              <MegaMenu
                categories={categories}
                status={categoriesStatus}
                onNavigate={() => setMegaOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* نوار جستجو */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-ink/10"
            >
              <form onSubmit={handleSearch} className="px-4 py-3 max-w-7xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی محصول..."
                  className="flex-1 bg-transparent border-b border-ink/30 focus:border-blue outline-none py-2 font-body text-ink"
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="جستجو"
                  className="text-ink hover:text-blue transition-colors"
                >
                  <Search size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* منوی موبایل - بیرون از div بلور‌شده تا fixed درست کار کنه */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        categoriesStatus={categoriesStatus}
        user={user}
        cartCount={cartCount}
        onLogout={handleLogout}
      />
    </header>
  );
}

export default Header;