import { useSelector } from "react-redux";

function FilterPanel({ selectedCategory, onCategoryChange, minPrice, maxPrice, onPriceChange, onClear }) {
  const categories = useSelector((state) => state.categories.items);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-body font-bold text-ink text-sm mb-3">دسته‌بندی</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange("")}
            className={`block text-sm font-body w-full text-right py-1 transition-colors ${
              !selectedCategory ? "text-blue font-bold" : "text-ink/60 hover:text-ink"
            }`}
          >
            همه
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat._id)}
              className={`block text-sm font-body w-full text-right py-1 transition-colors ${
                selectedCategory === cat._id ? "text-blue font-bold" : "text-ink/60 hover:text-ink"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-body font-bold text-ink text-sm mb-3">محدوده قیمت (تومان)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="از"
            value={minPrice}
            onChange={(e) => onPriceChange("min", e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm font-body outline-none focus:border-blue"
          />
          <span className="text-ink/30">—</span>
          <input
            type="number"
            placeholder="تا"
            value={maxPrice}
            onChange={(e) => onPriceChange("max", e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm font-body outline-none focus:border-blue"
          />
        </div>
      </div>

      <button onClick={onClear} className="text-sm font-body text-ink/50 hover:text-blue transition-colors underline">
        پاک‌کردن فیلترها
      </button>
    </div>
  );
}

export default FilterPanel;