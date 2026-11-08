export const PLACEMENT_LABELS = {
  hero: "بنر اصلی (هیرو)",
  promo: "بنر تبلیغاتی",
};

export const PLACEMENT_OPTIONS = Object.entries(PLACEMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

// ⚠️ اگه Thumb.jsx آدرس تصویر رو یه‌جور دیگه کامل می‌کنه، همون منطق رو اینجا بذار
export function toImageSrc(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${import.meta.env.VITE_UPLOADS_URL || ""}${url.startsWith("/") ? "" : "/"}${url}`;
}
// وضعیت واقعی نمایش بنر توی سایت (فعال بودن + بازه‌ی زمان‌بندی)
export function getBannerStatus(banner, now = Date.now()) {
  if (!banner.isActive) return { label: "غیرفعال", live: false };
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now)
    return { label: "زمان‌بندی‌شده", live: false };
  if (banner.endsAt && new Date(banner.endsAt).getTime() < now)
    return { label: "منقضی‌شده", live: false };
  return { label: "در حال نمایش", live: true };
}

export function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("fa-IR");
}

// ISO <-> مقدار input از نوع datetime-local (به وقت محلی)
export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// هماهنگ با BannerVl.js: مسیر داخلی یا https
export function isValidLink(value) {
  return (
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^https:\/\//i.test(value)
  );
}
