import { Users } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import { useAsync } from "../../hooks/useAsync";
import { getTopCustomers } from "../../services/dashboardApi";
import { formatNumber, formatToman, rangeLabel } from "../../utils/format";

function TopCustomersCard({ days, limit = 8, refreshKey = 0 }) {
  const state = useAsync(() => getTopCustomers({ days, limit }), [days, limit, refreshKey]);

  return (
    <AsyncCard
      title="مشتریان برتر"
      subtitle={`بر اساس مجموع خرید • ${rangeLabel(days)}`}
      state={state}
      isEmpty={(d) => d.length === 0}
      emptyIcon={Users}
      emptyTitle="هنوز خریدی ثبت نشده است"
    >
      {(data) => (
        <ul className="divide-y divide-ink/5">
          {data.map((customer, index) => (
            <li key={String(customer.userId)} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink/5 font-heading text-sm font-bold text-ink/60">
                {formatNumber(index + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{customer.name}</p>
                <p className="text-xs text-ink/40" dir="ltr">
                  {customer.phone || "—"}
                </p>
              </div>
              <div className="flex-shrink-0 text-left">
                <p className="text-sm font-bold text-ink">{formatToman(customer.totalSpent)}</p>
                <p className="text-xs text-ink/40">{formatNumber(customer.ordersCount)} سفارش</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AsyncCard>
  );
}

export default TopCustomersCard;