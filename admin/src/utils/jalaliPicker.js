const TZ = "Asia/Tehran";
const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

const partsFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: TZ,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const longFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const toDayNumber = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY_MS);

export const keyToDayNumber = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return toDayNumber(y, m, d);
};
export const dayNumberToKey = (n) =>
  new Date(n * DAY_MS).toISOString().slice(0, 10);

export const todayKey = () => keyFormatter.format(new Date());
export const isoToKey = (iso) => keyFormatter.format(new Date(iso));
export const addDaysToKey = (key, days) =>
  dayNumberToKey(keyToDayNumber(key) + days);

export const endOfDayIso = (key) =>
  new Date(
    new Date(`${key}T00:00:00+03:30`).getTime() + DAY_MS - 1,
  ).toISOString();

export function formatJalaliKey(key) {
  return longFormatter.format(new Date(`${key}T12:00:00+03:30`));
}

export function jalaliOfDay(dayNumber) {
  const parts = partsFormatter.formatToParts(
    new Date(dayNumber * DAY_MS + HALF_DAY_MS),
  );
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function jalaliToDayNumber(year, month, day) {
  const target = year * 10000 + month * 100 + day;
  let low = toDayNumber(year + 621, 1, 1);
  let high = toDayNumber(year + 622, 12, 31);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const p = jalaliOfDay(mid);
    const value = p.year * 10000 + p.month * 100 + p.day;

    if (value === target) return mid;
    if (value < target) low = mid + 1;
    else high = mid - 1;
  }
  return null;
}

export function daysInJalaliMonth(year, month) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return jalaliToDayNumber(year, 12, 30) === null ? 29 : 30;
}

export function endOfJalaliMonthKey(key) {
  const { year, month } = jalaliOfDay(keyToDayNumber(key));
  return dayNumberToKey(
    jalaliToDayNumber(year, month, daysInJalaliMonth(year, month)),
  );
}

export function endOfJalaliYearKey(key) {
  const { year } = jalaliOfDay(keyToDayNumber(key));
  return dayNumberToKey(
    jalaliToDayNumber(year, 12, daysInJalaliMonth(year, 12)),
  );
}
