import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { COLOR_PRESETS, SIZE_PRESETS } from "../../constants/catalog";
import { digitsOnly, groupVariants, MAX_STOCK, norm } from "./productForm";
import { formatNumber } from "../../utils/format";

const fieldClass = (error) =>
  `h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue ${
    error ? "border-red-500" : "border-ink/15"
  }`;

function QuickAddPanel({ onAdd }) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#121212");
  const [sizes, setSizes] = useState([]);
  const [customSize, setCustomSize] = useState("");
  const [stock, setStock] = useState("10");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const toggleSize = (size) => {
    setError(null);
    setMessage(null);
    setSizes((list) =>
      list.some((s) => norm(s) === norm(size))
        ? list.filter((s) => norm(s) !== norm(size))
        : [...list, size],
    );
  };

  const addCustomSize = () => {
    const size = customSize.trim();
    if (!size) return;
    if (size.length > 20) {
      setError("سایز بیش از حد طولانی است");
      return;
    }
    setSizes((list) =>
      list.some((s) => norm(s) === norm(size)) ? list : [...list, size],
    );
    setCustomSize("");
    setError(null);
  };

  const extraSizes = sizes.filter(
    (s) => !SIZE_PRESETS.some((p) => norm(p) === norm(s)),
  );

  const handleAdd = () => {
    if (!colorName.trim()) return setError("نام رنگ را وارد کنید");
    if (colorName.trim().length > 30)
      return setError("نام رنگ بیش از حد طولانی است");
    if (sizes.length === 0) return setError("حداقل یک سایز انتخاب کنید");
    if (stock === "" || Number(stock) > MAX_STOCK)
      return setError("موجودی اولیه نامعتبر است");

    const { added, skipped } = onAdd({
      color: colorName.trim(),
      colorHex,
      sizes,
      stock: Number(stock),
    });
    setError(null);
    setSizes([]);
    setMessage(
      added > 0
        ? `${formatNumber(added)} سایز اضافه شد${skipped ? ` (${formatNumber(skipped)} مورد قبلاً وجود داشت)` : ""}`
        : "همه‌ی این سایزها قبلاً برای این رنگ ثبت شده‌اند",
    );
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-4">
      <p className="mb-3 text-sm font-bold text-ink">افزودن رنگ و سایزها</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            title={preset.name}
            aria-label={preset.name}
            onClick={() => {
              setColorName(preset.name);
              setColorHex(preset.hex);
              setError(null);
            }}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              norm(colorName) === norm(preset.name)
                ? "border-blue"
                : "border-ink/15"
            }`}
            style={{ backgroundColor: preset.hex }}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_8rem]">
        <input
          value={colorName}
          onChange={(e) => {
            setColorName(e.target.value);
            setError(null);
          }}
          placeholder="نام رنگ (مثلاً مشکی)"
          aria-label="نام رنگ"
          maxLength={30}
          className={fieldClass(false)}
        />
        <label
          className="relative h-11 w-full cursor-pointer overflow-hidden rounded-xl border border-ink/15 sm:w-11"
          style={{ backgroundColor: colorHex }}
          title="انتخاب رنگ"
        >
          <input
            type="color"
            aria-label="انتخاب کد رنگ"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          value={stock}
          onChange={(e) => {
            setStock(digitsOnly(e.target.value));
            setError(null);
          }}
          inputMode="numeric"
          dir="ltr"
          aria-label="موجودی اولیه هر سایز"
          placeholder="موجودی هر سایز"
          maxLength={7}
          className={fieldClass(false)}
        />
      </div>

      <p className="mb-2 mt-4 text-xs text-ink/50">سایزها</p>
      <div className="flex flex-wrap gap-2">
        {SIZE_PRESETS.map((size) => {
          const active = sizes.some((s) => norm(s) === norm(size));
          return (
            <button
              key={size}
              type="button"
              aria-pressed={active}
              onClick={() => toggleSize(size)}
              className={`h-9 min-w-10 rounded-lg border px-3 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink font-bold text-paper"
                  : "border-ink/15 bg-white text-ink/70 hover:border-ink"
              }`}
            >
              {size}
            </button>
          );
        })}
        {extraSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 text-sm font-bold text-paper"
          >
            {size}
            <X size={13} />
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustomSize();
            }
          }}
          placeholder="سایز دیگر (مثلاً 48 یا Free)"
          aria-label="سایز دلخواه"
          maxLength={20}
          className={`${fieldClass(false)} max-w-56`}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-11"
          onClick={addCustomSize}
        >
          افزودن سایز
        </Button>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {message && !error && (
        <p className="mt-3 text-xs text-green-700">{message}</p>
      )}

      <Button icon={Plus} className="mt-4" onClick={handleAdd}>
        افزودن به تنوع‌ها
      </Button>
    </div>
  );
}

function ColorGroup({
  group,
  groupErrors = {},
  rowErrors,
  onGroup,
  onRow,
  onRemoveRow,
  onRemoveGroup,
  onAddSize,
}) {
  const total = group.rows.reduce((sum, r) => sum + (Number(r.stock) || 0), 0);

  return (
    <div className="rounded-2xl border border-ink/10 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <label
          title="انتخاب رنگ"
          className={`relative h-11 w-11 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border ${
            groupErrors.colorHex ? "border-red-500" : "border-ink/15"
          }`}
          style={{ backgroundColor: group.colorHex || "#f4f4f5" }}
        >
          <input
            type="color"
            aria-label="انتخاب کد رنگ"
            aria-invalid={Boolean(groupErrors.colorHex)}
            value={group.colorHex || "#d4d4d8"}
            onChange={(e) => onGroup({ colorHex: e.target.value })}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>

        <div className="min-w-40 flex-1">
          <input
            value={group.color}
            onChange={(e) => onGroup({ color: e.target.value })}
            aria-label="نام رنگ"
            aria-invalid={Boolean(groupErrors.color)}
            placeholder="نام رنگ"
            maxLength={30}
            className={fieldClass(groupErrors.color)}
          />
        </div>

        <div className="mr-auto flex items-center gap-3">
          <span className="text-xs text-ink/50">
            مجموع: {formatNumber(total)} عدد
          </span>
          <button
            type="button"
            onClick={onRemoveGroup}
            aria-label="حذف این رنگ"
            title="حذف این رنگ"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {(groupErrors.color || groupErrors.colorHex) && (
        <p className="mt-2 text-xs text-red-600">
          {[groupErrors.color, groupErrors.colorHex]
            .filter(Boolean)
            .join(" • ")}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-3 text-xs text-ink/50">
          <span>سایز</span>
          <span>موجودی</span>
          <span />
        </div>

        {group.rows.map((row) => {
          const errors = rowErrors[row.key] || {};
          return (
            <div key={row.key}>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-3">
                <input
                  value={row.size}
                  onChange={(e) => onRow(row.key, { size: e.target.value })}
                  aria-label="سایز"
                  aria-invalid={Boolean(errors.size)}
                  placeholder="مثلاً M"
                  maxLength={20}
                  className={fieldClass(errors.size)}
                />
                <input
                  value={row.stock}
                  onChange={(e) =>
                    onRow(row.key, { stock: digitsOnly(e.target.value) })
                  }
                  aria-label="موجودی"
                  aria-invalid={Boolean(errors.stock)}
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="0"
                  maxLength={7}
                  className={fieldClass(errors.stock)}
                />
                <button
                  type="button"
                  onClick={() => onRemoveRow(row.key)}
                  aria-label="حذف این سایز"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/30 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
              {(errors.size || errors.stock) && (
                <p className="mt-1.5 text-xs text-red-600">
                  {[errors.size, errors.stock].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        icon={Plus}
        className="mt-3"
        onClick={onAddSize}
      >
        افزودن سایز
      </Button>
    </div>
  );
}

function VariantsCard({
  variants,
  errors,
  onUpdateGroup,
  onUpdateRow,
  onRemoveRow,
  onRemoveGroup,
  onAddSize,
  onQuickAdd,
}) {
  const groups = useMemo(() => groupVariants(variants), [variants]);
  const total = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading font-bold text-ink">
          رنگ‌ها، سایزها و موجودی
        </h3>
        <span className="text-xs text-ink/50">
          {formatNumber(groups.length)} رنگ • {formatNumber(variants.length)}{" "}
          تنوع • {formatNumber(total)} عدد موجودی
        </span>
      </div>

      <QuickAddPanel onAdd={onQuickAdd} />

      {errors.variants && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {errors.variants}
        </p>
      )}

      {groups.length > 0 && (
        <div className="mt-5 space-y-4">
          {groups.map((group) => (
            <ColorGroup
              key={group.group}
              group={group}
              groupErrors={errors.groups[group.group]}
              rowErrors={errors.rows}
              onGroup={(patch) => onUpdateGroup(group.group, patch)}
              onRow={onUpdateRow}
              onRemoveRow={onRemoveRow}
              onRemoveGroup={() => onRemoveGroup(group.group)}
              onAddSize={() => onAddSize(group.group)}
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-6 text-ink/40">
        موجودی هر سایز را مستقیم وارد کنید؛ فقط موجودی‌هایی که تغییر داده‌اید
        ذخیره می‌شوند، پس خریدهای همزمان مشتری‌ها بازنویسی نمی‌شود. با حذف یک
        رنگ یا سایز، آن مورد از سبد خرید مشتریانی که انتخابش کرده‌اند هم حذف
        می‌شود.
      </p>
    </Card>
  );
}

export default VariantsCard;
