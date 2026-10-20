import { Search, X } from "lucide-react";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { formatNumber } from "../../utils/format";

const STATUS_TABS = [
  { key: "", label: "همه", countKey: "all" },
  { key: "active", label: "فعال", countKey: "active" },
  { key: "inactive", label: "غیرفعال", countKey: "inactive" },
  { key: "expired", label: "منقضی", countKey: "expired" },
  { key: "exhausted", label: "ظرفیت تمام‌شده", countKey: "exhausted" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "expiry", label: "نزدیک‌ترین انقضا" },
  { value: "usage", label: "بیشترین استفاده" },
];

function CouponFilters({
  filters,
  searchText,
  onSearchText,
  counts = {},
  onChange,
  onClear,
  hasFilters,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30"
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchText(e.target.value)}
            placeholder="جستجوی کد تخفیف"
            aria-label="جستجوی کد تخفیف"
            dir="ltr"
            style={{ textAlign: "right" }}
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue"
          />
        </div>

        <Select
          aria-label="مرتب‌سازی"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.key;
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
                  {formatNumber(counts[tab.countKey] || 0)}
                </span>
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClear}
            className="flex-shrink-0"
          >
            پاک‌کردن
          </Button>
        )}
      </div>
    </div>
  );
}

export default CouponFilters;
