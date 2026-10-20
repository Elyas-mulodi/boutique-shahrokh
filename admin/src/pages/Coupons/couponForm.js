import { normalizeDigits } from "../../utils/text";
import {
  addDaysToKey,
  endOfDayIso,
  isoToKey,
  keyToDayNumber,
  todayKey,
} from "../../utils/jalaliPicker";

export const MAX_AMOUNT = 10000000000;
export const MAX_USAGE = 10000000;
export const SAMPLE_AMOUNT = 1000000;

const CODE_RE = /^[A-Z0-9_-]{3,20}$/;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون حروف و اعداد شبیه هم

export const digitsOnly = (value) => normalizeDigits(value).replace(/\D/g, "");
export const sanitizeCode = (value) =>
  normalizeDigits(value)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 20);

export function generateCode(length = 8) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

export const STATUS_META = {
  active: { label: "فعال", tone: "success" },
  inactive: { label: "غیرفعال", tone: "neutral" },
  expired: { label: "منقضی", tone: "danger" },
  exhausted: { label: "ظرفیت تمام‌شده", tone: "warning" },
};

// اولویت: غیرفعال > منقضی > ظرفیت تمام‌شده > فعال (هماهنگ با سرور)
export function getCouponStatus(coupon, now = Date.now()) {
  if (coupon.isActive === false) return "inactive";
  if (new Date(coupon.expiresAt).getTime() <= now) return "expired";
  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return "exhausted";
  }
  return "active";
}

export function getExpiryInfo(expiresAt) {
  if (new Date(expiresAt).getTime() <= Date.now())
    return { text: "منقضی شده", tone: "text-red-600" };

  const diff = keyToDayNumber(isoToKey(expiresAt)) - keyToDayNumber(todayKey());
  if (diff <= 0) return { text: "امروز تمام می‌شود", tone: "text-amber-700" };
  return {
    text: `${diff.toLocaleString("fa-IR")} روز دیگر`,
    tone: diff <= 3 ? "text-amber-700" : "text-ink/40",
  };
}

export function buildInitialState(coupon) {
  if (!coupon) {
    return {
      code: "",
      type: "percent",
      value: "",
      maxDiscount: "",
      minOrderAmount: "",
      usageLimit: "",
      expiryKey: addDaysToKey(todayKey(), 30),
      isActive: true,
    };
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
    minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
    usageLimit:
      coupon.usageLimit !== null && coupon.usageLimit !== undefined
        ? String(coupon.usageLimit)
        : "",
    expiryKey: isoToKey(coupon.expiresAt),
    isActive: coupon.isActive !== false,
  };
}

// محاسبه‌ی تخفیف؛ باید با سرور یکی باشه
export function computeDiscount(form, amount) {
  const value = Number(form.value);
  let discount =
    form.type === "percent" ? Math.floor((amount * value) / 100) : value;

  if (form.type === "percent" && form.maxDiscount) {
    discount = Math.min(discount, Number(form.maxDiscount));
  }
  return Math.min(discount, amount);
}

export function validateCoupon(
  form,
  { editing, usedCount = 0, originalExpiryKey = null },
) {
  const errors = {};

  if (!editing && !CODE_RE.test(form.code)) {
    errors.code = "کد باید ۳ تا ۲۰ کاراکتر باشد (حروف انگلیسی، عدد، - و _)";
  }

  const value = Number(form.value);
  if (!form.value) errors.value = "مقدار تخفیف را وارد کنید";
  else if (!Number.isInteger(value) || value < 1)
    errors.value = "مقدار تخفیف باید بیشتر از صفر باشد";
  else if (form.type === "percent" && value > 100)
    errors.value = "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد";
  else if (value > MAX_AMOUNT) errors.value = "مقدار تخفیف بیش از حد مجاز است";

  if (form.type === "percent" && form.maxDiscount) {
    const max = Number(form.maxDiscount);
    if (!Number.isInteger(max) || max < 1)
      errors.maxDiscount = "سقف تخفیف باید بیشتر از صفر باشد";
    else if (max > MAX_AMOUNT)
      errors.maxDiscount = "سقف تخفیف بیش از حد مجاز است";
  }

  if (form.minOrderAmount && Number(form.minOrderAmount) > MAX_AMOUNT) {
    errors.minOrderAmount = "حداقل مبلغ سفارش بیش از حد مجاز است";
  }

  if (form.usageLimit) {
    const limit = Number(form.usageLimit);
    if (!Number.isInteger(limit) || limit < 1)
      errors.usageLimit = "سقف استفاده باید حداقل ۱ باشد";
    else if (limit > MAX_USAGE)
      errors.usageLimit = "سقف استفاده بیش از حد مجاز است";
    else if (editing && limit < usedCount) {
      errors.usageLimit = `نمی‌تواند کمتر از تعداد استفاده‌شده (${usedCount.toLocaleString("fa-IR")}) باشد`;
    }
  }

  if (!form.expiryKey) {
    errors.expiry = "تاریخ انقضا را انتخاب کنید";
  } else if (
    form.expiryKey !== originalExpiryKey &&
    keyToDayNumber(form.expiryKey) < keyToDayNumber(todayKey())
  ) {
    errors.expiry = "تاریخ انقضا باید امروز یا بعد از آن باشد";
  }

  return errors;
}

export function buildPayload(form, { editing, originalExpiryKey }) {
  const payload = {
    type: form.type,
    value: Number(form.value),
    maxDiscount:
      form.type === "percent" && form.maxDiscount
        ? Number(form.maxDiscount)
        : null,
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    isActive: form.isActive,
  };

  if (!editing) payload.code = form.code;
  // تاریخ دست‌نخورده ارسال نمیشه (کد منقضی‌ای که فقط چیز دیگه‌ای تو ش عوض میشه رد نشه)
  if (!editing || form.expiryKey !== originalExpiryKey)
    payload.expiresAt = endOfDayIso(form.expiryKey);

  return payload;
}
