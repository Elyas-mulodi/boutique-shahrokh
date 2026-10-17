// لیست تخت دسته‌بندی‌ها → ترتیب درختی (والد، بعد فرزندان) با عمق و برچسب
export function flattenCategories(list = []) {
  const ids = new Set(list.map((c) => String(c._id)));
  const childrenOf = new Map();

  list.forEach((category) => {
    const parentKey = category.parent && ids.has(String(category.parent)) ? String(category.parent) : "root";
    if (!childrenOf.has(parentKey)) childrenOf.set(parentKey, []);
    childrenOf.get(parentKey).push(category);
  });

  const result = [];
  const visited = new Set();

  const visit = (parentKey, depth) => {
    (childrenOf.get(parentKey) || []).forEach((category) => {
      const key = String(category._id);
      if (visited.has(key)) return;
      visited.add(key);

      result.push({
        ...category,
        depth,
        label: `${depth ? `${"—".repeat(depth)} ` : ""}${category.name}${category.isActive === false ? " (غیرفعال)" : ""}`,
      });
      visit(key, depth + 1);
    });
  };

  visit("root", 0);
  return result;
}