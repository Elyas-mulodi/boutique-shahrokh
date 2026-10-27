import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, XCircle } from "lucide-react";

const MESSAGES = {
  order_not_found: "سفارش مورد نظر یافت نشد.",
  verify_pending:
    "وضعیت پرداخت شما هنوز مشخص نشده است. اگر مبلغ از حساب شما کسر شده، تا چند دقیقه دیگر به‌صورت خودکار تایید می‌شود و سفارش را در «سفارش‌های من» می‌بینید؛ در غیر این صورت مبلغ به حساب شما برمی‌گردد.",
  verify_failed:
    "تایید پرداخت از سمت درگاه انجام نشد. اگر مبلغ از حساب شما کسر شده، تا چند دقیقه دیگر وضعیت سفارش بروزرسانی می‌شود؛ در غیر این صورت با پشتیبانی تماس بگیرید.",
};

function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const pending = reason === "verify_pending" || reason === "verify_failed";
  const Icon = pending ? Clock : XCircle;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          pending ? "bg-ink/5" : "bg-red-50"
        }`}
      >
        <Icon
          size={44}
          className={pending ? "text-ink/50" : "text-red-500"}
          strokeWidth={1.5}
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-heading text-ink text-2xl font-bold"
      >
        {pending ? "در حال بررسی پرداخت" : "پرداخت ناموفق بود"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-body text-ink/60 text-sm mt-2 max-w-sm leading-7"
      >
        {MESSAGES[reason] ||
          "پرداخت انجام نشد یا توسط شما لغو شد. می‌توانید دوباره تلاش کنید."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 mt-8"
      >
        {pending ? (
          <Link
            to="/profile?tab=orders"
            className="bg-ink text-paper font-body text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
          >
            سفارش‌های من
          </Link>
        ) : (
          <Link
            to="/cart"
            className="bg-ink text-paper font-body text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
          >
            بازگشت به سبد خرید
          </Link>
        )}
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
