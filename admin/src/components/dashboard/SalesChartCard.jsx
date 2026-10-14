import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import SegmentedControl from "../ui/SegmentedControl";
import ChangeBadge from "../ui/ChangeBadge";
import { GRANULARITIES, bucketSeries, defaultGranularity } from "../../utils/jalali";
import {
  formatCompactToman,
  formatNumber,
  formatToman,
  percentChange,
} from "../../utils/format";

const METRICS = {
  revenue: { label: "درآمد", color: "#2D4FFF", format: formatToman, axis: formatCompactToman },
  orders: { label: "تعداد سفارش", color: "#121212", format: formatNumber, axis: formatNumber },
  newUsers: { label: "کاربران جدید", color: "#16A34A", format: formatNumber, axis: formatNumber },
};

const METRIC_OPTIONS = Object.entries(METRICS).map(([value, m]) => ({ value, label: m.label }));
const AXIS_TICK = { fontSize: 11, fill: "rgba(18,18,18,0.5)" };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="min-w-44 rounded-xl border border-ink/10 bg-white p-3 text-xs shadow-xl">
      <p className="mb-2 font-bold text-ink">
        {row.fullLabel}
        {row.partial ? " (ناقص)" : ""}
      </p>
      <div className="space-y-1.5">
        {Object.entries(METRICS).map(([key, metric]) => (
          <div key={key} className="flex items-center justify-between gap-6">
            <span className="text-ink/50">{metric.label}</span>
            <span className="font-bold text-ink">{metric.format(row[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function ChartBody({ data }) {
  const [metric, setMetric] = useState("revenue");
  const [granularity, setGranularity] = useState(() => defaultGranularity(data.days));
  const gradientId = useId().replace(/:/g, "");

  const rows = useMemo(() => bucketSeries(data.series, granularity), [data.series, granularity]);
  const labelByKey = useMemo(() => Object.fromEntries(rows.map((r) => [r.key, r.label])), [rows]);

  const config = METRICS[metric];
  const total = data.totals[metric];
  const change = percentChange(total, data.previous?.[metric] ?? 0);
  const average = total / data.days;
  const best = rows.reduce((acc, row) => (row[metric] > (acc?.[metric] ?? 0) ? row : acc), null);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl size="sm" ariaLabel="شاخص نمودار" options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
        <SegmentedControl
          size="sm"
          ariaLabel="گروه‌بندی زمانی"
          options={GRANULARITIES}
          value={granularity}
          onChange={setGranularity}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="min-w-0">
          <p className="text-xs text-ink/40">مجموع</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-ink">{config.format(total)}</p>
            <ChangeBadge change={change} />
          </div>
        </div>
        <MiniStat
          label="میانگین روزانه"
          value={config.format(metric === "revenue" ? Math.round(average) : Math.round(average * 10) / 10)}
        />
        <div className="col-span-2 sm:col-span-1">
          <MiniStat
            label="بیشترین"
            value={best ? `${config.format(best[metric])} • ${best.label}` : "—"}
          />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={rows} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(18,18,18,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="key"
              reversed
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              tickFormatter={(key) => labelByKey[key] ?? ""}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              orientation="right"
              width={78}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              tickFormatter={config.axis}
              allowDecimals={false}
              domain={[0, (max) => Math.max(max, 1)]}
            />
            <Tooltip
              content={(props) => <ChartTooltip {...props} />}
              cursor={{ stroke: "rgba(18,18,18,0.15)" }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={config.color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={rows.length <= 31 ? { r: 2.5, fill: config.color, strokeWidth: 0 } : false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {rows.some((r) => r.partial) && (
        <p className="mt-3 text-xs text-ink/40">
          هفته یا ماه ناقص (ابتدا یا انتهای بازه) با عبارت «ناقص» در توضیح نمودار مشخص شده است.
        </p>
      )}
    </div>
  );
}

function SalesChartCard({ state, title = "نمودار فروش", subtitle, actions }) {
  return (
    <AsyncCard
      title={title}
      subtitle={subtitle || "فقط سفارش‌های پرداخت‌شده و لغونشده در درآمد حساب می‌شوند"}
      actions={actions}
      state={state}
      isEmpty={(d) => d.totals.revenue === 0 && d.totals.orders === 0 && d.totals.newUsers === 0}
      emptyIcon={BarChart3}
      emptyTitle="در این بازه فروشی ثبت نشده است"
      emptyDescription="سفارش‌های پرداخت‌نشده یا لغوشده در آمار فروش حساب نمی‌شوند."
    >
      {(data) => <ChartBody data={data} />}
    </AsyncCard>
  );
}

export default SalesChartCard;