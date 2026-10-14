import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import Badge from "../ui/Badge";
import { useAsync } from "../../hooks/useAsync";
import { getRecentOrders } from "../../services/dashboardApi";
import { ORDER_STATUS_BADGE } from "../../constants/orderStatus";
import { formatJalaliDateTime, formatToman } from "../../utils/format";

function RecentOrdersCard({ refreshKey = 0 }) {
  const state = useAsync(() => getRecentOrders(8), [refreshKey]);

  return (
    <AsyncCard
      title="آخرین سفارش‌ها"
      subtitle="سفارش‌های پرداخت‌شده"
      state={state}
      actions={
        <Link to="/orders" className="text-xs font-bold text-blue hover:underline">
          مشاهده همه
        </Link>
      }
      isEmpty={(d) => d.length === 0}
      emptyIcon={ShoppingBag}
      emptyTitle="هنوز سفارشی ثبت نشده است"
    >
      {(data) => (
        <ul className="divide-y divide-ink/5">
          {data.map((order) => {
            const badge = ORDER_STATUS_BADGE[order.status] || ORDER_STATUS_BADGE.pending_payment;
            return (
              <li key={order._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    <span dir="ltr">#{String(order._id).slice(-6).toUpperCase()}</span>
                    <span className="mr-2 font-normal text-ink/60">{order.user?.name || "کاربر حذف‌شده"}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink/40">
                    {order.address?.city || "—"} • {formatJalaliDateTime(order.paidAt || order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-bold text-ink">{formatToman(order.totalAmount)}</span>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AsyncCard>
  );
}

export default RecentOrdersCard;