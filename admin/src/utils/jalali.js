const TZ = "Asia/Tehran";

const partsFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: TZ,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const dayMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
});
const monthYearFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  month: "long",
  year: "numeric",
});
const fullFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
});

// کلید روز تهران ("YYYY-MM-DD") → Date ظهر همون روز (دور از مرز نیمه‌شب)
export const keyToDate = (key) => new Date(`${key}T12:00:00+03:30`);

function addDaysToKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function jalaliOf(key) {
  const parts = partsFormatter.formatToParts(keyToDate(key));
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// هفته ایرانی از شنبه شروع میشه
function weekStartKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // ۰ = یکشنبه ... ۶ = شنبه
  return addDaysToKey(key, -((dayOfWeek + 1) % 7));
}

export const GRANULARITIES = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" },
];

export function defaultGranularity(days) {
  if (days <= 31) return "day";
  if (days <= 100) return "week";
  return "month";
}

/**
 * series: [{ date: "YYYY-MM-DD", revenue, orders, newUsers }]
 * خروجی: ردیف‌های گروه‌بندی‌شده با label (برای محور) و fullLabel (برای tooltip)
 */
export function bucketSeries(series, granularity) {
  if (granularity === "day") {
    return series.map((row) => {
      const date = keyToDate(row.date);
      return {
        ...row,
        key: row.date,
        label: dayMonthFormatter.format(date),
        fullLabel: fullFormatter.format(date),
        partial: false,
      };
    });
  }

  const buckets = new Map();

  for (const row of series) {
    const jalali = jalaliOf(row.date);
    const key =
      granularity === "week"
        ? weekStartKey(row.date)
        : `${jalali.year}-${String(jalali.month).padStart(2, "0")}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        revenue: 0,
        orders: 0,
        newUsers: 0,
        days: 0,
        firstDate: row.date,
        lastDate: row.date,
        hasMonthStart: false,
        hasMonthEnd: false,
      };
      buckets.set(key, bucket);
    }

    bucket.revenue += row.revenue;
    bucket.orders += row.orders;
    bucket.newUsers += row.newUsers;
    bucket.days += 1;
    bucket.lastDate = row.date;

    if (granularity === "month") {
      if (jalali.day === 1) bucket.hasMonthStart = true;
      if (jalaliOf(addDaysToKey(row.date, 1)).month !== jalali.month) bucket.hasMonthEnd = true;
    }
  }

  return [...buckets.values()].map((b) => {
    const first = keyToDate(b.firstDate);
    const last = keyToDate(b.lastDate);

    if (granularity === "week") {
      return {
        ...b,
        label: dayMonthFormatter.format(first),
        fullLabel:
          b.firstDate === b.lastDate
            ? fullFormatter.format(first)
            : `${dayMonthFormatter.format(first)} تا ${fullFormatter.format(last)}`,
        partial: b.days < 7,
      };
    }

    return {
      ...b,
      label: monthYearFormatter.format(first),
      fullLabel: monthYearFormatter.format(first),
      partial: !(b.hasMonthStart && b.hasMonthEnd),
    };
  });
}