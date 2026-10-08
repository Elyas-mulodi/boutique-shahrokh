import { useState } from "react";
import { motion } from "framer-motion";

function AuthBanner({ mode, onSwitch }) {
  const isLogin = mode === "login";
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      style={{ order: isLogin ? 2 : 1 }}
      className="relative hidden md:flex md:w-2/5 overflow-hidden bg-ink"
    >
      {/* پس‌زمینه: عکس اگه بود، وگرنه گرادینت + شکل‌های دکوراتیو */}
      {!imgError ? (
        <img
          src="/assets/auth-banner.jpg"
          alt="بوتیک شاهرخ"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-blue/30 to-ink" />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-paper/10 blur-3xl" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/40" />

      {/* محتوا - وسط‌چین عمودی، نه ته صفحه */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-10 w-full">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="font-heading text-paper/90 text-2xl font-bold block mb-4">بوتیک شاهرخ</span>

          <h2 className="font-heading text-paper text-2xl font-bold">
            {isLogin ? "خوش برگشتی" : "به ما بپیوند"}
          </h2>
          <p className="font-body text-paper/70 text-sm mt-3 max-w-xs mx-auto">
            {isLogin
              ? "برای ادامه خرید و پیگیری سفارش‌هات وارد حساب کاربری‌ت شو."
              : "با ساخت حساب کاربری، جدیدترین کالکشن‌ها و تخفیف‌ها رو از دست نده."}
          </p>

          <button
            onClick={() => onSwitch(isLogin ? "register" : "login")}
            className="mt-6 border border-paper/40 rounded-full px-6 py-2.5 text-sm font-body text-paper hover:bg-paper hover:text-ink transition-colors"
          >
            {isLogin ? "ساخت حساب کاربری جدید" : "ورود به حساب موجود"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AuthBanner;