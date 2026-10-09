import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shirt,
  LayoutGrid,
  ShoppingBag,
  User,
  Package,
  Headphones,
  LogOut,
  ChevronDown,
  Phone,
} from "lucide-react";
import ErrorState from "../ErrorState";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { STORE } from "../../constants/storeInfo";
const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 32,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

function MenuLink({ to, icon: Icon, children, onClick, badge = 0 }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center justify-between py-3.5 border-b border-ink/10 text-ink font-body"
      >
        <span className="flex items-center gap-3">
          <Icon size={19} className="text-ink/50" />
          {children}
        </span>
        {badge > 0 && (
          <span className="bg-blue text-paper text-[11px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center font-bold">
            {badge.toLocaleString("fa-IR")}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

function MobileMenu({
  open,
  onClose,
  categories,
  categoriesStatus,
  user,
  cartCount,
  onLogout,
}) {
  const dispatch = useDispatch();
  const [catsOpen, setCatsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // جلوگیری از اسکرول صفحه پشت منو
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCatsOpen(false);
      setExpandedId(null);
    }
  }, [open]);

  const isLoading =
    categoriesStatus === "loading" || categoriesStatus === "idle";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 z-40 md:hidden"
            onClick={onClose}
          />

          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-[88%] max-w-sm bg-paper z-50 md:hidden flex flex-col"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-ink/10 flex-shrink-0">
              <span className="font-heading text-ink text-lg">بوتیک شاهرخ</span>
              <button
                onClick={onClose}
                aria-label="بستن منو"
                className="text-ink"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* بلوک کاربر */}
              <motion.div variants={itemVariants} className="mb-4">
                {user ? (
                  <div className="flex items-center gap-3 bg-ink/5 rounded-2xl p-4">
                    <div className="w-11 h-11 rounded-full bg-ink text-paper flex items-center justify-center font-heading font-bold flex-shrink-0">
                      {user.name?.[0] || "؟"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-bold text-ink text-sm truncate">
                        {user.name}
                      </p>
                      <p
                        className="font-body text-ink/50 text-xs mt-0.5"
                        dir="ltr"
                      >
                        {user.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="block text-center bg-ink text-paper font-body font-bold py-3 rounded-full hover:bg-blue transition-colors"
                  >
                    ورود / ثبت‌نام
                  </Link>
                )}
              </motion.div>

              <MenuLink to="/products" icon={Shirt} onClick={onClose}>
                همه محصولات
              </MenuLink>

              {/* دسته‌بندی‌ها - آکاردئون */}
              <motion.div
                variants={itemVariants}
                className="border-b border-ink/10"
              >
                <button
                  onClick={() => setCatsOpen((v) => !v)}
                  aria-expanded={catsOpen}
                  className="w-full flex items-center justify-between py-3.5 text-ink font-body"
                >
                  <span className="flex items-center gap-3">
                    <LayoutGrid size={19} className="text-ink/50" />
                    دسته‌بندی‌ها
                  </span>
                  <motion.span
                    animate={{ rotate: catsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={17} className="text-ink/50" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {catsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-3 pr-8">
                        {isLoading ? (
                          <div className="space-y-3 py-2 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-4 bg-ink/10 rounded w-1/2"
                              />
                            ))}
                          </div>
                        ) : categoriesStatus === "failed" ? (
                          <ErrorState
                            message="خطا در دریافت دسته‌بندی‌ها"
                            onRetry={() => dispatch(fetchCategories())}
                          />
                        ) : (
                          categories.map((cat) => (
                            <div key={cat._id}>
                              <div className="flex items-center justify-between">
                                <Link
                                  to={`/category/${cat.slug}`}
                                  onClick={onClose}
                                  className="flex-1 py-2.5 text-sm font-body text-ink/80"
                                >
                                  {cat.name}
                                </Link>
                                {cat.children?.length > 0 && (
                                  <button
                                    onClick={() =>
                                      setExpandedId(
                                        expandedId === cat._id ? null : cat._id,
                                      )
                                    }
                                    aria-label={`زیردسته‌های ${cat.name}`}
                                    className="p-2 text-ink/40"
                                  >
                                    <motion.span
                                      className="block"
                                      animate={{
                                        rotate:
                                          expandedId === cat._id ? 180 : 0,
                                      }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown size={15} />
                                    </motion.span>
                                  </button>
                                )}
                              </div>

                              <AnimatePresence initial={false}>
                                {expandedId === cat._id &&
                                  cat.children?.length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden pr-4"
                                    >
                                      {cat.children.map((child) => (
                                        <Link
                                          key={child._id}
                                          to={`/category/${child.slug}`}
                                          onClick={onClose}
                                          className="block py-2 text-sm font-body text-ink/50"
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <MenuLink
                to="/cart"
                icon={ShoppingBag}
                badge={cartCount}
                onClick={onClose}
              >
                سبد خرید
              </MenuLink>

              {user && (
                <>
                  <MenuLink to="/profile" icon={User} onClick={onClose}>
                    حساب کاربری
                  </MenuLink>
                  <MenuLink
                    to="/profile?tab=orders"
                    icon={Package}
                    onClick={onClose}
                  >
                    سفارش‌های من
                  </MenuLink>
                </>
              )}

              <MenuLink to="/contact" icon={Headphones} onClick={onClose}>
                پشتیبانی
              </MenuLink>
            </div>

            <div className="px-5 py-4 border-t border-ink/10 flex-shrink-0 space-y-3">
              <a
                href={`tel:${STORE.phone}`}
                className="flex items-center gap-2 text-sm text-ink/60 font-body"
              >
                <Phone size={15} />
                <span dir="ltr">{STORE.phoneDisplay}</span>
              </a>
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center gap-2 text-sm font-body text-red-500"
                >
                  <LogOut size={16} />
                  خروج از حساب
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
