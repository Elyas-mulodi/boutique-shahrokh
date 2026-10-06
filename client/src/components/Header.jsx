import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { fetchCategories } from "../redux/slices/categorySlice";

const sampleCategories = [
  { _id: "sample-1", name: "زنانه", slug: "women" },
  { _id: "sample-2", name: "مردانه", slug: "men" },
  { _id: "sample-3", name: "بچگانه", slug: "kids" },
  { _id: "sample-4", name: "اکسسوری", slug: "accessories" },
];

const menuVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 32,
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const categoriesFromApi = useSelector((state) => state.categories.items);
  const categories =
    categoriesFromApi.length > 0 ? categoriesFromApi : sampleCategories;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* این بخش backdrop-blur داره - فقط ردیف بالا + نوار سرچ، نه کل header */}
      <div className="bg-paper/95 backdrop-blur-md border-b border-ink/10">
        <motion.div
          animate={{ height: scrolled ? 64 : 84 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`max-w-7xl mx-auto px-4 flex items-center justify-between ${scrolled ? "shadow-sm" : ""}`}
        >
          {/* همبرگر + لوگو کنار هم */}
          <div className="flex items-center gap-3">
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

          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <NavLink
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="relative group py-2"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`text-sm font-body transition-colors duration-200 ${
                        isActive
                          ? "text-blue"
                          : "text-ink group-hover:text-blue"
                      }`}
                    >
                      {cat.name}
                    </span>
                    <motion.span
                      className="absolute bottom-0 right-0 left-0 h-[1.5px] bg-blue origin-center"
                      initial={false}
                      animate={{ scaleX: isActive ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="جستجو"
              className="text-ink hover:text-blue transition-colors"
            >
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </motion.button>

            <Link
              to="/account"
              aria-label="حساب کاربری"
              className="text-ink hover:text-blue transition-colors"
            >
              <User size={22} />
            </Link>

            <Link
              to="/cart"
              aria-label="سبد خرید"
              className="relative text-ink hover:text-blue transition-colors"
            >
              <ShoppingBag size={22} />
              <span className="absolute -top-1.5 -left-1.5 bg-amber text-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </Link>
          </div>
        </motion.div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-ink/10"
            >
              <div className="px-4 py-3 max-w-7xl mx-auto">
                <input
                  type="text"
                  placeholder="جستجوی محصول..."
                  className="w-full bg-transparent border-b border-ink/30 focus:border-blue outline-none py-2 font-body text-ink"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* این دو تا بیرون از div بالا هستن (بدون backdrop-blur در مسیر والدشون) تا fixed درست کار کنه */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-72 bg-paper p-5 flex flex-col gap-1 z-50 md:hidden"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="self-start text-ink mb-6"
                aria-label="بستن منو"
              >
                <X size={24} />
              </button>
              {categories.map((cat) => (
                <motion.div key={cat._id} variants={itemVariants}>
                  <NavLink
                    to={`/category/${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `py-3 border-b border-ink/10 font-body block transition-colors ${
                        isActive ? "text-blue" : "text-ink"
                      }`
                    }
                  >
                    {cat.name}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
