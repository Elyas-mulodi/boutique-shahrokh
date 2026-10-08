import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package } from "lucide-react";
import { getOrderById } from "../../services/orderApi";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch(() => {});
  }, [orderId]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-20 h-20 rounded-full bg-blue/10 flex items-center justify-center mb-6 mx-auto"
        >
          <CheckCircle2 size={44} className="text-blue" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-heading text-ink text-2xl font-bold"
      >
        پرداخت با موفقیت انجام شد
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-body text-ink/60 text-sm mt-2 max-w-xs"
      >
        سفارش شما ثبت شد و به‌زودی آماده‌سازی می‌شود.
      </motion.p>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-ink/5 rounded-2xl px-6 py-4 mt-6 flex items-center gap-3"
        >
          <Package size={18} className="text-ink/50" />
          <div className="text-right">
            <p className="font-body text-xs text-ink/50">کد پیگیری سفارش</p>
            <p className="font-body text-sm text-ink font-bold" dir="ltr">
              {order._id}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-3 mt-8"
      >
        <Link
          to="/products"
          className="border border-ink/15 text-ink font-body text-sm px-6 py-2.5 rounded-full hover:border-ink transition-colors"
        >
          ادامه خرید
        </Link>
        <Link
          to="/"
          className="bg-ink text-paper font-body text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          بازگشت به صفحه اصلی
        </Link>
      </motion.div>
    </div>
  );
}

export default PaymentSuccess;