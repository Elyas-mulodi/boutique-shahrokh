import { normalizeDigits } from "./text";

// نام محصول → آدرس (slug): حروف فارسی و انگلیسی و عدد، با خط تیره
export function slugify(value = "") {
  return normalizeDigits(value)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s_]+/g, "-")
    .replace(
      /[^\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CCa-zA-Z0-9-]/g,
      "",
    )
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
