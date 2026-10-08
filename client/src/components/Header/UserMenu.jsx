import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, LogOut } from "lucide-react";

function UserMenu({ onLogout }) {
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  if (!user) {
    return (
      <Link to="/account" aria-label="ورود / ثبت‌نام" className="text-ink hover:text-blue transition-colors">
        <User size={22} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="منوی کاربر"
        aria-expanded={open}
        className={`transition-colors ${open ? "text-blue" : "text-ink hover:text-blue"}`}
      >
        <User size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-4 w-56 bg-paper border border-ink/10 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-ink/10">
              <p className="font-body font-bold text-ink text-sm truncate">{user.name}</p>
              <p className="font-body text-ink/50 text-xs mt-0.5" dir="ltr">
                {user.phone}
              </p>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-body text-ink hover:bg-ink/5 transition-colors"
            >
              <User size={16} className="text-ink/50" />
              حساب کاربری
            </Link>
            <Link
              to="/profile?tab=orders"
              className="flex items-center gap-3 px-4 py-3 text-sm font-body text-ink hover:bg-ink/5 transition-colors"
            >
              <Package size={16} className="text-ink/50" />
              سفارش‌های من
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors border-t border-ink/10"
            >
              <LogOut size={16} />
              خروج از حساب
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserMenu;