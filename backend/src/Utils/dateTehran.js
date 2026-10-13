export const TEHRAN_TZ = "Asia/Tehran";

const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000; // ایران ساعت تابستانی ندارد
const DAY_MS = 24 * 60 * 60 * 1000;

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TEHRAN_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const jalaliDayFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: TEHRAN_TZ,
  day: "numeric",
});

// "YYYY-MM-DD" میلادی به وقت تهران
export const tehranDateKey = (date = new Date()) => keyFormatter.format(date);

// شروع روز (۰۰:۰۰ تهران) به‌صورت Date
export function startOfTehranDay(date = new Date()) {
  const [y, m, d] = tehranDateKey(date).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - TEHRAN_OFFSET_MS);
}

// شروع ماه شمسیِ جاری
export function startOfJalaliMonth(date = new Date()) {
  const dayOfMonth = Number(jalaliDayFormatter.format(date));
  return new Date(startOfTehranDay(date).getTime() - (dayOfMonth - 1) * DAY_MS);
}

export const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);