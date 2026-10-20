import { useMemo } from "react";
import Select from "./Select";
import {
  JALALI_MONTHS,
  dayNumberToKey,
  daysInJalaliMonth,
  formatJalaliKey,
  jalaliOfDay,
  jalaliToDayNumber,
  keyToDayNumber,
  todayKey,
} from "../../utils/jalaliPicker";
import { formatNumber } from "../../utils/format";

// value: کلید روز ("YYYY-MM-DD" میلادی)؛ خروجی هم همین قالبه
function JalaliDateField({
  label,
  value,
  onChange,
  error,
  hint,
  presets = [],
}) {
  const parts = useMemo(() => jalaliOfDay(keyToDayNumber(value)), [value]);
  const todayYear = useMemo(
    () => jalaliOfDay(keyToDayNumber(todayKey())).year,
    [],
  );

  const years = useMemo(() => {
    const start = Math.min(todayYear, parts.year);
    const end = Math.max(todayYear + 5, parts.year);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [todayYear, parts.year]);

  const dayCount = daysInJalaliMonth(parts.year, parts.month);

  const emit = (year, month, day) => {
    const safeDay = Math.min(day, daysInJalaliMonth(year, month));
    const dayNumber = jalaliToDayNumber(year, month, safeDay);
    if (dayNumber !== null) onChange(dayNumberToKey(dayNumber));
  };

  return (
    <div role="group" aria-label={label}>
      <p className="mb-1.5 text-sm text-ink/70">{label}</p>

      {presets.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={preset.key === value}
              onClick={() => onChange(preset.key)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                preset.key === value
                  ? "border-ink bg-ink font-bold text-paper"
                  : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2">
        <Select
          aria-label="روز"
          value={parts.day}
          onChange={(e) =>
            emit(parts.year, parts.month, Number(e.target.value))
          }
        >
          {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day}>
              {formatNumber(day)}
            </option>
          ))}
        </Select>

        <Select
          aria-label="ماه"
          value={parts.month}
          onChange={(e) => emit(parts.year, Number(e.target.value), parts.day)}
        >
          {JALALI_MONTHS.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </Select>

        <Select
          aria-label="سال"
          value={parts.year}
          onChange={(e) => emit(Number(e.target.value), parts.month, parts.day)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year.toLocaleString("fa-IR", { useGrouping: false })}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-ink/40">
          {hint || formatJalaliKey(value)}
        </p>
      )}
    </div>
  );
}

export default JalaliDateField;
