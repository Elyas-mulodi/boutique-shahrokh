import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6"
      >
        <XCircle size={44} className="text-red-500" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-heading text-ink text-2xl font-bold"
      >
        پرداخت ناموفق بود
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-body text-ink/60 text-sm mt-2 max-w-xs"
      >
        {reason === "order_not_found"
          ? "سفارش مورد نظر یافت نشد."
          : "پرداخت انجام نشد یا توسط شما لغو شد. می‌توانید دوباره تلاش کنید."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 mt-8"
      >
        <Link
          to="/cart"
          className="bg-ink text-paper font-body text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          بازگشت به سبد خرید
        </Link>
        <Link
          to="/"
          className="border border-ink/15 text-ink font-body text-sm px-6 py-2.5 rounded-full hover:border-ink transition-colors"
        >
          صفحه اصلی
        </Link>
      </motion.div>
    </div>
  );
}

export default PaymentFailed;