const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function startOfTehranDay(date = new Date()) {
  const [y, m, d] = keyFormatter.format(date).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - TEHRAN_OFFSET_MS);
}

export function rangeToFrom(range) {
  if (!range) return null;
  const today = startOfTehranDay();
  if (range === "today") return today;
  const days = Number(range);
  return days > 0 ? new Date(today.getTime() - (days - 1) * DAY_MS) : null;
}