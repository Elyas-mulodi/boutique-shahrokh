import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { getMe } from "../../services/userApi";
import { logout } from "../../redux/slices/authSlice";
import { resetCart } from "../../redux/slices/cartSlice";
import ErrorState from "../../components/ErrorState";
import InfoTab from "./InfoTab";
import AddressTab from "./AddressTab";
import OrdersTab from "./OrdersTab";

const tabs = [
  { key: "info", label: "اطلاعات حساب" },
  { key: "orders", label: "سفارش‌های من" },
  { key: "address", label: "آدرس" },
];

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-24 rounded-3xl bg-ink/10" />
      <div className="h-11 rounded-full bg-ink/10 mt-6 max-w-md mx-auto" />
      <div className="h-48 rounded-2xl bg-ink/10 mt-8" />
    </div>
  );
}

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("loading");

  const requested = searchParams.get("tab");
  const tab = tabs.some((t) => t.key === requested) ? requested : "info";

  const fetchMe = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await getMe();
      setMe(res.data.data);
      setStatus("succeeded");
    } catch (err) {
      if (err?.response?.status === 401) {
        dispatch(logout());
        navigate("/account", { replace: true });
        return;
      }
      setStatus("failed");
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate("/");
  };

  if (status === "loading") {
    return (
      <div className="py-8 md:py-10 max-w-3xl mx-auto">
        <ProfileSkeleton />
      </div>
    );
  }

  if (status === "failed" || !me) {
    return (
      <div className="py-16">
        <ErrorState message="خطا در دریافت اطلاعات حساب" onRetry={fetchMe} />
      </div>
    );
  }

  return (
    <div className="py-8 md:py-10 max-w-3xl mx-auto">
      <div className="bg-ink rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-paper text-ink flex items-center justify-center font-heading text-xl font-bold flex-shrink-0">
            {me.name?.[0] || "؟"}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-paper font-bold text-lg truncate">{me.name}</h1>
            <p className="font-body text-paper/60 text-sm mt-0.5" dir="ltr">
              {me.phone}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-paper/25 text-paper rounded-full px-4 py-2 text-sm font-body hover:bg-paper hover:text-ink transition-colors flex-shrink-0"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>

      <div className="relative flex bg-ink/5 rounded-full p-1 mt-6 max-w-md mx-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSearchParams({ tab: t.key })}
            className="relative flex-1 py-2.5 text-sm font-body z-10"
          >
            {tab === t.key && (
              <motion.span
                layoutId="profileTab"
                className="absolute inset-0 bg-ink rounded-full -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className={tab === t.key ? "text-paper" : "text-ink/60"}>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "info" && <InfoTab me={me} onUpdated={setMe} />}
            {tab === "orders" && <OrdersTab />}
            {tab === "address" && <AddressTab me={me} onUpdated={setMe} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProfilePage;