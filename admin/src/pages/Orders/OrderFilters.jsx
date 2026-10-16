import { AlertTriangle, Search, X } from "lucide-react";
import Select from "../../components/ui/Select";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Button from "../../components/ui/Button";
import { formatNumber } from "../../utils/format";

const PAYMENT_OPTIONS = [
  { value: "paid", label: "پرداخت‌شده" },
  { value: "unpaid", label: "پرداخت‌نشده" },
  { value: "all", label: "همه" },
];

const RANGE_OPTIONS = [
  { value: "", label: "همه زمان‌ها" },
  { value: "today", label: "امروز" },
  { value: "7", label: "۷ روز اخیر" },
  { value: "30", label: "۳۰ روز اخیر" },
  { value: "90", label: "۹۰ روز اخیر" },
];

const STATUS_TABS = [
  { key: "", label: "همه" },
  { key: "processing", label: "در حال پردازش" },
  { key: "shipped", label: "ارسال‌شده" },
  { key: "delivered", label: "تحویل‌شده" },
  { key: "canceled", label: "لغو‌شده" },
  { key: "pending_payment", label: "در انتظار پرداخت" },
];

const TABS_BY_PAYMENT = {
  paid: ["processing", "shipped", "delivered", "canceled"],
  unpaid: ["pending_payment", "canceled"],
  all: ["processing", "shipped", "delivered", "canceled", "pending_payment"],
};

function OrderFilters({
  filters,
  searchText,
  onSearchText,
  counts = {},
  attentionCount = 0,
  onChange,
  onClear,
  hasFilters,
}) {
  const allowed = TABS_BY_PAYMENT[filters.paymentStatus];
  const tabs = STATUS_TABS.filter(
    (tab) =>
      tab.key === "" || allowed.includes(tab.key) || tab.key === filters.status || (counts[tab.key] || 0) > 0
  );
  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchText(e.target.value)}
            placeholder="جستجو: نام، موبایل، کد سفارش، کد رهگیری"
            aria-label="جستجوی سفارش"
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue"
          />
        </div>

        <Select
          aria-label="بازه تاریخ ثبت"
          value={filters.range}
          onChange={(e) => onChange({ range: e.target.value })}
          containerClassName="md:w-48"
        >
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          size="sm"
          ariaLabel="وضعیت پرداخت"
          options={PAYMENT_OPTIONS}
          value={filters.paymentStatus}
          onChange={(value) => onChange({ paymentStatus: value })}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" icon={X} onClick={onClear}>
            پاک‌کردن فیلترها
          </Button>
        )}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map((tab) => {
          const active = filters.status === tab.key;
          const count = tab.key === "" ? totalCount : counts[tab.key] || 0;
          return (
            <button
              key={tab.key || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ status: tab.key })}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink font-bold text-paper"
                  : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 text-xs ${active ? "bg-paper/20 text-paper" : "bg-ink/5 text-ink/50"}`}
              >
                {formatNumber(count)}
              </span>
            </button>
          );
        })}

        {(attentionCount > 0 || filters.attention) && (
          <button
            type="button"
            aria-pressed={filters.attention}
            onClick={() => onChange({ attention: !filters.attention })}
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              filters.attention
                ? "border-orange-600 bg-orange-600 font-bold text-white"
                : "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400"
            }`}
          >
            <AlertTriangle size={15} />
            نیازمند بررسی
            <span className="rounded-full bg-white/60 px-1.5 text-xs">{formatNumber(attentionCount)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderFilters;