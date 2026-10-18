import { normalizeDigits } from "./text";

// باید با MAX_DEPTH بک‌اند یکی باشد
export const MAX_CATEGORY_DEPTH = 3;

const normalizeText = (value = "") =>
  normalizeDigits(value)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, " ")
    .trim()
    .toLowerCase();

export function buildIndex(list = []) {
  const byId = new Map(list.map((c) => [String(c._id), c]));
  const childrenOf = new Map();

  list.forEach((category) => {
    const key =
      category.parent && byId.has(String(category.parent))
        ? String(category.parent)
        : "root";
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key).push(category);
  });

  return { byId, childrenOf };
}

export function getDescendantIds(index, id) {
  const result = new Set();
  const stack = [String(id)];

  while (stack.length) {
    const key = stack.pop();
    (index.childrenOf.get(key) || []).forEach((child) => {
      const childId = String(child._id);
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    });
  }
  return result;
}

// ریشه = ۱
export function getDepth(index, id) {
  let depth = 1;
  let current = index.byId.get(String(id));
  let guard = 0;

  while (
    current?.parent &&
    index.byId.has(String(current.parent)) &&
    guard < 20
  ) {
    depth += 1;
    current = index.byId.get(String(current.parent));
    guard += 1;
  }
  return depth;
}

// برگ = ۱
export function getSubtreeHeight(index, id) {
  let max = 1;
  const stack = [[String(id), 1]];
  const seen = new Set();

  while (stack.length) {
    const [key, level] = stack.pop();
    if (seen.has(key)) continue;
    seen.add(key);
    max = Math.max(max, level);
    (index.childrenOf.get(key) || []).forEach((child) =>
      stack.push([String(child._id), level + 1]),
    );
  }
  return max;
}

// لیست تخت → ترتیب درختی (والد، بعد فرزندان) با عمق (از صفر) و برچسب
export function flattenCategories(list = []) {
  const index = buildIndex(list);
  const result = [];
  const visited = new Set();

  const visit = (key, depth) => {
    (index.childrenOf.get(key) || []).forEach((category) => {
      const id = String(category._id);
      if (visited.has(id)) return;
      visited.add(id);

      result.push({
        ...category,
        depth,
        label: `${depth ? `${"—".repeat(depth)} ` : ""}${category.name}${category.isActive === false ? " (غیرفعال)" : ""}`,
      });
      visit(id, depth + 1);
    });
  };

  visit("root", 0);
  return result;
}

// گزینه‌های «والد» برای فرم؛ خود دسته، زیرمجموعه‌هاش و والدهایی که عمق مجاز رو رد می‌کنن غیرفعالن
export function getParentOptions(list = [], editingId = null) {
  const index = buildIndex(list);
  const blocked = new Set();
  let height = 1;

  if (editingId) {
    blocked.add(String(editingId));
    getDescendantIds(index, editingId).forEach((id) => blocked.add(id));
    height = getSubtreeHeight(index, editingId);
  }

  return flattenCategories(list).map((category) => {
    const id = String(category._id);
    const isSelfOrChild = blocked.has(id);
    const tooDeep = getDepth(index, id) + height > MAX_CATEGORY_DEPTH;

    let label = category.label;
    if (isSelfOrChild) label += " (خود دسته یا زیرمجموعه)";
    else if (tooDeep) label += " (عمق مجاز نیست)";

    return { value: id, label, disabled: isSelfOrChild || tooDeep };
  });
}

// جستجو بین نام و آدرس؛ والدهای نتایج هم برای حفظ ساختار نمایش داده میشن
export function filterCategories(rows = [], term = "") {
  const needle = normalizeText(term);
  if (!needle) return rows;

  const index = buildIndex(rows);
  const keep = new Set();

  rows.forEach((category) => {
    if (
      !normalizeText(category.name).includes(needle) &&
      !normalizeText(category.slug).includes(needle)
    )
      return;

    let current = category;
    let guard = 0;
    while (current && guard < 20) {
      keep.add(String(current._id));
      current = current.parent ? index.byId.get(String(current.parent)) : null;
      guard += 1;
    }
  });

  return rows.filter((category) => keep.has(String(category._id)));
}
