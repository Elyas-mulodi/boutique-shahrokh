import { normalizeDigits } from "../../utils/text";

export const MAX_IMAGES = 10;
export const MAX_STOCK = 1000000;
export const MAX_PRICE = 10000000000;
export const LOW_STOCK_THRESHOLD = 5;

const HEX6 = /^#[0-9a-fA-F]{6}$/;
const SLUG_RE = /^[^\s/?#%\\]+$/;

export const norm = (value) => String(value ?? "").trim().toLowerCase();
export const digitsOnly = (value) => normalizeDigits(value).replace(/\D/g, "");

let counter = 0;
export const newKey = (prefix = "new") => {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
};

function expandHex(hex) {
  const value = String(hex || "").trim();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return HEX6.test(value) ? value.toLowerCase() : "";
}

export function buildInitialState(product) {
  if (!product) {
    return {
      name: "",
      slug: "",
      slugTouched: false,
      description: "",
      price: "",
      category: "",
      isActive: true,
      images: [],
      variants: [],
    };
  }

  // تنوع‌های هم‌رنگ تو یک گروه جمع میشن
  const groupIds = new Map();
  const groupHex = new Map();
  product.variants.forEach((v) => {
    const key = norm(v.color);
    if (!groupIds.has(key)) groupIds.set(key, `g-${groupIds.size}`);
    const hex = expandHex(v.colorHex);
    if (hex && !groupHex.get(key)) groupHex.set(key, hex);
  });

  return {
    name: product.name,
    slug: product.slug,
    slugTouched: true,
    description: product.description || "",
    price: String(product.price),
    category: String(product.category?._id || product.category || ""),
    isActive: Boolean(product.isActive),
    images: [...(product.images || [])],
    variants: product.variants.map((v) => ({
      key: String(v._id),
      _id: String(v._id),
      group: groupIds.get(norm(v.color)),
      color: v.color,
      colorHex: groupHex.get(norm(v.color)) || "",
      size: v.size,
      stock: String(v.stock),
      originalStock: v.stock,
    })),
  };
}

export function groupVariants(variants) {
  const groups = [];
  const index = new Map();

  variants.forEach((variant) => {
    if (!index.has(variant.group)) {
      index.set(variant.group, groups.length);
      groups.push({ group: variant.group, color: variant.color, colorHex: variant.colorHex, rows: [] });
    }
    groups[index.get(variant.group)].rows.push(variant);
  });

  return groups;
}

export const emptyErrors = { groups: {}, rows: {} };

export function validateProduct(state) {
  const errors = { groups: {}, rows: {} };

  const name = state.name.trim();
  if (name.length < 2) errors.name = "نام محصول را وارد کنید (حداقل ۲ حرف)";
  else if (name.length > 150) errors.name = "نام محصول بیش از حد طولانی است";

  const slug = state.slug.trim();
  if (slug.length < 2) errors.slug = "آدرس (slug) را وارد کنید";
  else if (!SLUG_RE.test(slug)) errors.slug = "آدرس نباید فاصله یا کاراکترهای / ? # % داشته باشد";

  const price = Number(state.price);
  if (!state.price) errors.price = "قیمت را وارد کنید";
  else if (!Number.isInteger(price) || price <= 0) errors.price = "قیمت باید بیشتر از صفر باشد";
  else if (price > MAX_PRICE) errors.price = "قیمت بیش از حد مجاز است";

  if (!state.category) errors.category = "دسته‌بندی را انتخاب کنید";

  if (state.variants.length === 0) {
    errors.variants = "حداقل یک رنگ با یک سایز اضافه کنید";
    return errors;
  }

  // خطاهای سطح رنگ
  const groupInfo = new Map();
  state.variants.forEach((v) => {
    if (!groupInfo.has(v.group)) groupInfo.set(v.group, v);
  });

  const seenColors = new Set();
  groupInfo.forEach((first, group) => {
    const groupErrors = {};
    const colorName = first.color.trim();

    if (!colorName) groupErrors.color = "نام رنگ را وارد کنید";
    else if (colorName.length > 30) groupErrors.color = "نام رنگ بیش از حد طولانی است";
    else if (seenColors.has(norm(colorName))) groupErrors.color = "این رنگ قبلاً اضافه شده؛ سایزها را به همان رنگ اضافه کنید";
    if (colorName) seenColors.add(norm(colorName));

    if (!HEX6.test(first.colorHex)) groupErrors.colorHex = "رنگ را انتخاب کنید";

    if (Object.keys(groupErrors).length) errors.groups[group] = groupErrors;
  });

  // خطاهای سطح سایز
  const seenSizes = new Set();
  state.variants.forEach((v) => {
    const rowErrors = {};
    const size = v.size.trim();

    if (!size) rowErrors.size = "سایز را وارد کنید";
    else if (size.length > 20) rowErrors.size = "سایز بیش از حد طولانی است";
    else {
      const key = `${v.group}|${norm(size)}`;
      if (seenSizes.has(key)) rowErrors.size = "این سایز تکراری است";
      seenSizes.add(key);
    }

    if (v.stock === "") rowErrors.stock = "موجودی را وارد کنید";
    else if (!/^\d+$/.test(v.stock) || Number(v.stock) > MAX_STOCK) rowErrors.stock = "موجودی نامعتبر است";

    if (Object.keys(rowErrors).length) errors.rows[v.key] = rowErrors;
  });

  return errors;
}

export const hasErrors = (errors) =>
  Boolean(
    errors.name ||
      errors.slug ||
      errors.price ||
      errors.category ||
      errors.variants ||
      Object.keys(errors.groups).length ||
      Object.keys(errors.rows).length
  );

export function buildPayload(state) {
  return {
    name: state.name.trim(),
    slug: state.slug.trim().toLowerCase(),
    description: state.description.trim(),
    price: Number(state.price),
    category: state.category,
    images: state.images,
    isActive: state.isActive,
    variants: state.variants.map((v) => {
      const base = { size: v.size.trim(), color: v.color.trim(), colorHex: v.colorHex.toLowerCase() };
      const stock = Number(v.stock);

      // تنوع جدید: موجودی همیشه ارسال میشه
      if (!v._id) return { ...base, stock };

      // تنوع موجود: فقط اگه ادمین موجودی رو تغییر داده (جلوگیری از بازنویسی خریدهای همزمان)
      return { _id: v._id, ...base, ...(stock !== v.originalStock && { stock }) };
    }),
  };
}

// وضعیت موجودی محصول برای لیست (آستانه‌ها با داشبورد یکی است)
export function getStockInfo(variants = []) {
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  if (variants.length === 0 || total === 0) return { total, tone: "danger", label: "ناموجود" };

  const out = variants.filter((v) => v.stock === 0).length;
  if (out > 0) return { total, tone: "warning", label: `${out.toLocaleString("fa-IR")} تنوع تمام‌شده` };

  const low = variants.some((v) => v.stock <= LOW_STOCK_THRESHOLD);
  if (low) return { total, tone: "warning", label: "موجودی کم" };

  return { total, tone: "success", label: "موجود" };
}