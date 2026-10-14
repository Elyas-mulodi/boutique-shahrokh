import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, PackageX, Truck } from "lucide-react";
import { formatNumber } from "../../utils/format";

const tones = {
  danger: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue/20 bg-blue/5 text-blue",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  neutral: "border-ink/10 bg-white text-ink/70",
  success: "border-green-200 bg-green-50 text-green-700",
};

function AttentionStrip({ overview }) {
  if (!overview) return null;

  const { attention, orders, products } = overview;
  const items = [];

  if (attention.stockProblemOrders > 0) {
    items.push({
      key: "stock",
      tone: "danger",
      icon: AlertTriangle,
      text: `${formatNumber(attention.stockProblemOrders)} سفارش پرداخت‌شده با مشکل موجودی`,
      to: "/orders?attention=1",
    });
  }
  if (attention.processingOrders > 0) {
    items.push({
      key: "processing",
      tone: "blue",
      icon: Truck,
      text: `${formatNumber(attention.processingOrders)} سفارش در انتظار ارسال`,
      to: "/orders?status=processing",
    });
  }
  if (products.outOfStockVariants > 0) {
    items.push({
      key: "out",
      tone: "danger",
      icon: PackageX,
      text: `${formatNumber(products.outOfStockVariants)} تنوع محصول تمام‌شده`,
      to: "/products?stock=out",
    });
  }
  if (products.lowStockVariants > 0) {
    items.push({
      key: "low",
      tone: "warning",
      icon: PackageX,
      text: `${formatNumber(products.lowStockVariants)} تنوع محصول با موجودی کم`,
      to: "/products?stock=low",
    });
  }
  if (orders.unpaid > 0) {
    items.push({
      key: "unpaid",
      tone: "neutral",
      icon: Clock,
      text: `${formatNumber(orders.unpaid)} سفارش در انتظار پرداخت مشتری`,
      to: "/orders?paymentStatus=unpaid",
    });
  }

  if (items.length === 0) {
    return (
      <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${tones.success}`}>
        <CheckCircle2 size={20} />
        مورد نیازمند اقدامی وجود ندارد.
      </div>
    );
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ key, tone, icon: Icon, text, to }) => (
        <Link
          key={key}
          to={to}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition-shadow hover:shadow-md ${tones[tone]}`}
        >
          <Icon size={20} className="flex-shrink-0" />
          <span>{text}</span>
        </Link>
      ))}
    </div>
  );
}

export default AttentionStrip;