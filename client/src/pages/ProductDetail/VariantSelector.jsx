import { motion } from "framer-motion";

function VariantSelector({ variants, selectedColor, selectedSize, onSelectColor, onSelectSize }) {
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  const isSizeAvailable = (size) => {
    if (!selectedColor) return variants.some((v) => v.size === size && v.stock > 0);
    return variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0);
  };

  const isColorAvailable = (color) => {
    if (!selectedSize) return variants.some((v) => v.color === color && v.stock > 0);
    return variants.some((v) => v.color === color && v.size === selectedSize && v.stock > 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-body font-bold text-ink text-sm mb-3">رنگ</h3>
        <div className="flex items-center gap-2.5">
          {colors.map((color) => {
            const available = isColorAvailable(color);
            const selected = selectedColor === color;
            return (
              <button
                key={color}
                disabled={!available}
                onClick={() => onSelectColor(color)}
                className="relative w-9 h-9 rounded-full disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label={color}
              >
                <span
                  className="absolute inset-1 rounded-full border border-ink/10"
                  style={{ backgroundColor: color }}
                />
                {selected && (
                  <motion.span
                    layoutId="colorRing"
                    className="absolute inset-0 rounded-full border-2 border-blue"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-body font-bold text-ink text-sm mb-3">سایز</h3>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => {
            const available = isSizeAvailable(size);
            const selected = selectedSize === size;
            return (
              <button
                key={size}
                disabled={!available}
                onClick={() => onSelectSize(size)}
                className={`relative min-w-11 h-11 px-3 rounded-xl border font-body text-sm transition-colors ${
                  !available
                    ? "border-ink/10 text-ink/25 cursor-not-allowed line-through"
                    : selected
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 text-ink hover:border-ink"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VariantSelector;