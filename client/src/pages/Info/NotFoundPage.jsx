import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="font-heading text-ink/10 text-[8rem] md:text-[11rem] leading-none font-bold select-none"
      >
        ۴۰۴
      </motion.p>

      <h1 className="font-heading text-ink text-2xl font-bold -mt-4 md:-mt-8">
        صفحه‌ای که دنبالش بودید پیدا نشد
      </h1>
      <p className="font-body text-ink/60 text-sm mt-3 max-w-sm">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه دیگر وجود نداشته باشد.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link
          to="/"
          className="bg-ink text-paper font-body font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          صفحه اصلی
        </Link>
        <Link
          to="/products"
          className="border border-ink/15 text-ink font-body px-6 py-2.5 rounded-full hover:border-ink transition-colors"
        >
          مشاهده محصولات
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;