import { Search, X } from "lucide-react";
import Select from "../../components/ui/Select";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Button from "../../components/ui/Button";
import { flattenCategories } from "../../utils/categories";

const STATUS_OPTIONS = [
  { value: "", label: "همه" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
];

const STOCK_OPTIONS = [
  { value: "", label: "همه موجودی‌ها" },
  { value: "low", label: "موجودی کم" },
  { value: "out", label: "تنوع تمام‌شده" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "name", label: "نام (الفبا)" },
];

function ProductFilters({ filters, searchText, onSearchText, categoriesState, onChange, onClear, hasFilters }) {
  const options = flattenCategories(categoriesState.data || []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_14rem_11rem]">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchText(e.target.value)}
            placeholder="جستجو: نام یا آدرس محصول"
            aria-label="جستجوی محصول"
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue"
          />
        </div>

        <Select
          aria-label="دسته‌بندی"
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          disabled={Boolean(categoriesState.error) && !categoriesState.data}
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {options.map((category) => (
            <option key={category._id} value={category._id}>
              {category.label}
            </option>
          ))}
        </Select>

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
            ariaLabel="وضعیت نمایش"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value) => onChange({ status: value })}
          />
          <SegmentedControl
            size="sm"
            ariaLabel="وضعیت موجودی"
            options={STOCK_OPTIONS}
            value={filters.stock}
            onChange={(value) => onChange({ stock: value })}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" icon={X} onClick={onClear}>
            پاک‌کردن فیلترها
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductFilters;