import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PackageOpen, ImageOff, Trash2 } from "lucide-react";
import { getMyOrders, deleteOrder } from "../../services/orderApi";
import ErrorState from "../../components/ErrorState";

const statusMap = {
  pending_payment: {
    label: "در انتظار پرداخت",
    className: "bg-ink/5 text-ink/70",
  },
  processing: { label: "در حال پردازش", className: "bg-blue/10 text-blue" },
  shipped: { label: "ارسال شده", className: "bg-blue/10 text-blue" },
  delivered: { label: "تحویل شده", className: "bg-ink text-paper" },
  canceled: { label: "لغو شده", className: "bg-red-50 text-red-500" },
};

function OrdersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-ink/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 bg-ink/10 rounded w-1/4" />
            <div className="h-6 bg-ink/10 rounded-full w-24" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="w-14 h-16 rounded-lg bg-ink/10" />
            ))}
          </div>
          <div className="h-4 bg-ink/10 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const status = statusMap[order.status] || statusMap.pending_payment;
  const shown = order.items.slice(0, 4);
  const extra = order.items.length - shown.length;
  const canDelete = order.paymentStatus !== "paid";

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteOrder(order._id);
      onDeleted(order._id);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "خطا در حذف سفارش");
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="border border-ink/10 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body font-bold text-ink text-sm" dir="ltr">
              #{order._id.slice(-6).toUpperCase()}
            </p>
            <p className="font-body text-ink/50 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`font-body text-xs font-bold px-3 py-1.5 rounded-full ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {shown.map((item, i) => (
            <div
              key={i}
              className="w-14 h-16 rounded-lg overflow-hidden bg-ink/5 flex items-center justify-center"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageOff size={16} className="text-ink/25" />
              )}
            </div>
          ))}
          {extra > 0 && (
            <div className="w-14 h-16 rounded-lg bg-ink/5 flex items-center justify-center font-body text-sm text-ink/60">
              +{extra.toLocaleString("fa-IR")}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="font-heading font-bold text-ink text-sm">
            {order.totalAmount.toLocaleString("fa-IR")} تومان
          </p>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1 text-blue text-sm font-body"
          >
            جزئیات
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </div>

        {canDelete && (
          <div className="mt-4 pt-4 border-t border-ink/10">
            {confirming ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-body text-sm text-ink/70">
                  این سفارش حذف شود؟
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-500 text-paper text-sm font-body font-bold px-4 py-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "در حال حذف..." : "بله، حذف"}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="border border-ink/15 text-ink text-sm font-body px-4 py-2 rounded-full hover:border-ink transition-colors disabled:opacity-50"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 text-sm font-body text-ink/50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
                حذف سفارش
              </button>
            )}
            {deleteError && (
              <p className="text-sm font-body text-red-500 mt-2">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink/10 bg-ink/[0.03] p-5 space-y-5">
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm font-body"
                  >
                    <div className="min-w-0">
                      <p className="text-ink truncate">{item.name}</p>
                      <p className="text-ink/50 text-xs mt-0.5">
                        سایز {item.size} • {item.color} •{" "}
                        {item.quantity.toLocaleString("fa-IR")} عدد
                      </p>
                    </div>
                    <span className="text-ink whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString("fa-IR")}{" "}
                      تومان
                    </span>
                  </div>
                ))}
              </div>

              {(order.shippingCost > 0 || order.discountAmount > 0) && (
                <div className="border-t border-ink/10 pt-4 space-y-2">
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm font-body text-ink/70">
                      <span>هزینه ارسال</span>
                      <span>
                        {order.shippingCost.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm font-body text-blue">
                      <span>
                        تخفیف {order.couponCode ? `(${order.couponCode})` : ""}
                      </span>
                      <span>
                        - {order.discountAmount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-ink/10 pt-4">
                <p className="font-body text-xs text-ink/50 mb-1.5">
                  آدرس تحویل
                </p>
                <p className="font-body text-sm text-ink leading-6">
                  {order.address.province}، {order.address.city}،{" "}
                  {order.address.fullAddress}
                </p>
                <p className="font-body text-xs text-ink/50 mt-1">
                  {order.address.receiverName} •{" "}
                  <span dir="ltr">{order.address.receiverPhone}</span> • کد پستی{" "}
                  {order.address.postalCode}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  const fetchOrders = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await getMyOrders();
      setOrders(res.data.data);
      setStatus("succeeded");
    } catch {
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeleted = (id) =>
    setOrders((list) => list.filter((o) => o._id !== id));

  if (status === "loading") return <OrdersSkeleton />;
  if (status === "failed")
    return (
      <ErrorState message="خطا در دریافت سفارش‌ها" onRetry={fetchOrders} />
    );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center">
          <PackageOpen size={28} className="text-ink/30" />
        </div>
        <p className="font-body text-ink/60">هنوز سفارشی ثبت نکرده‌اید</p>
        <Link
          to="/products"
          className="bg-ink text-paper font-body font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {orders.map((order) => (
          <motion.div
            key={order._id}
            layout
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <OrderCard order={order} onDeleted={handleDeleted} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default OrdersTab;
