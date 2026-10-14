import { PieChart } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import DonutChart from "../charts/DonutChart";
import { useAsync } from "../../hooks/useAsync";
import { getOrderStatus } from "../../services/dashboardApi";
import { ORDER_STATUS } from "../../constants/orderStatus";
import { formatNumber, formatToman, rangeLabel } from "../../utils/format";

function OrderStatusCard({ days, refreshKey = 0 }) {
  const state = useAsync(() => getOrderStatus(days), [days, refreshKey]);

  return (
    <AsyncCard
      title="وضعیت سفارش‌ها"
      subtitle={`سفارش‌های ثبت‌شده در ${rangeLabel(days)}`}
      state={state}
      isEmpty={(d) => d.total.count === 0}
      emptyIcon={PieChart}
      emptyTitle="در این بازه سفارشی ثبت نشده است"
    >
      {(data) => {
        const segments = data.buckets
          .filter((b) => ORDER_STATUS[b.key])
          .map((b) => ({
            key: b.key,
            label: ORDER_STATUS[b.key].label,
            color: ORDER_STATUS[b.key].color,
            value: b.count,
            amount: b.amount,
          }));

        return (
          <div>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <DonutChart segments={segments} centerValue={formatNumber(data.total.count)} centerLabel="سفارش" />

              <ul className="w-full flex-1 space-y-3">
                {segments.map((s) => {
                  const percent = data.total.count ? Math.round((s.value / data.total.count) * 1000) / 10 : 0;
                  return (
                    <li key={s.key} className="flex items-start justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-start gap-2">
                        <span
                          className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-ink/70">{s.label}</span>
                          <span className="block text-xs text-ink/40">{formatToman(s.amount)}</span>
                        </span>
                      </span>
                      <span className="flex-shrink-0 text-left">
                        <span className="font-bold text-ink">{formatNumber(s.value)}</span>
                        <span className="mr-1.5 text-xs text-ink/40">({formatNumber(percent)}٪)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-6 text-ink/40">
              فقط سفارش‌های «در حال پردازش»، «ارسال‌شده» و «تحویل‌شده» در درآمد حساب می‌شوند.
            </p>
          </div>
        );
      }}
    </AsyncCard>
  );
}

export default OrderStatusCard;