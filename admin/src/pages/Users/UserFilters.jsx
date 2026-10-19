import { Search, X } from "lucide-react";
import Select from "../../components/ui/Select";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Button from "../../components/ui/Button";
import { formatNumber } from "../../utils/format";

const ROLE_OPTIONS = [
  { value: "", label: "همه نقش‌ها" },
  { value: "customer", label: "مشتریان" },
  { value: "admin", label: "مدیران" },
];

const STATUS_OPTIONS = [
  { value: "", label: "همه" },
  { value: "false", label: "فعال" },
  { value: "true", label: "مسدود" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین عضو" },
  { value: "oldest", label: "قدیمی‌ترین عضو" },
  { value: "name", label: "نام (الفبا)" },
];

function UserFilters({ filters, searchText, onSearchText, counts, onChange, onClear, hasFilters }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_11rem]">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchText(e.target.value)}
            placeholder="جستجو: نام یا شماره موبایل"
            aria-label="جستجوی کاربر"
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue"
          />
        </div>

        <Select aria-label="مرتب‌سازی" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            size="sm"
            ariaLabel="نقش"
            options={ROLE_OPTIONS}
            value={filters.role}
            onChange={(value) => onChange({ role: value })}
          />
          <SegmentedControl
            size="sm"
            ariaLabel="وضعیت حساب"
            options={STATUS_OPTIONS}
            value={filters.blocked}
            onChange={(value) => onChange({ blocked: value })}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" icon={X} onClick={onClear}>
            پاک‌کردن فیلترها
          </Button>
        )}
      </div>

      {counts && (
        <p className="text-xs text-ink/40">
          {filters.search ? "در نتایج جستجو: " : "همه کاربران: "}
          {formatNumber(counts.customers)} مشتری • {formatNumber(counts.admins)} مدیر • {formatNumber(counts.blocked)} مسدود
        </p>
      )}
    </div>
  );
}

export default UserFilters;