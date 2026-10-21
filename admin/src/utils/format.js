const TZ = "Asia/Tehran";
const faNumber = new Intl.NumberFormat("fa-IR");

export const formatNumber = (n) => faNumber.format(Number(n) || 0);
export const formatToman = (n) => `${formatNumber(n)} تومان`;

export function formatCompactToman(n) {
  const value = Number(n) || 0;
  if (value >= 1e9) return `${faNumber.format(Math.round(value / 1e8) / 10)} میلیارد`;
  if (value >= 1e6) return `${faNumber.format(Math.round(value / 1e5) / 10)} میلیون`;
  if (value >= 1e3) return `${faNumber.format(Math.round(value / 1e3))} هزار`;
  return faNumber.format(value);
}

const jalaliLong = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  year: "numeric",
  month: "long",
  day: "numeric",
});
const jalaliShort = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("fa-IR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatJalaliDate = (value) => {
  const d = toDate(value);
  return d ? jalaliLong.format(d) : "—";
};
export const formatJalaliShortDate = (value) => {
  const d = toDate(value);
  return d ? jalaliShort.format(d) : "—";
};
export const formatTime = (value) => {
  const d = toDate(value);
  return d ? timeFormat.format(d) : "—";
};
export const formatJalaliDateTime = (value) => {
  const d = toDate(value);
  return d ? `${jalaliShort.format(d)} • ${timeFormat.format(d)}` : "—";
};

export const percentChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const rangeLabel = (days) => {
  if (!days) return "کل زمان";
  if (days === 365) return "یک سال اخیر";
  return `${formatNumber(days)} روز اخیر`;
};