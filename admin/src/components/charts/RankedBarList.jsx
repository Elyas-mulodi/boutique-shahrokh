import { motion } from "framer-motion";
import Thumb from "../ui/Thumb";
import { formatNumber } from "../../utils/format";

// items: [{ id, title, subtitle?, value, valueLabel, image? }] (image=undefined یعنی بدون تصویر)
function RankedBarList({ items, color = "#2D4FFF" }) {
  const max = Math.max(0, ...items.map((item) => item.value));

  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const percent = max > 0 ? Math.max((item.value / max) * 100, 2) : 0;
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span className="w-5 flex-shrink-0 text-center text-xs font-bold text-ink/30">
              {formatNumber(index + 1)}
            </span>
            {item.image !== undefined && <Thumb key={item.image || "none"} src={item.image} alt={item.title} />}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                <p className="flex-shrink-0 text-xs font-bold text-ink">{item.valueLabel}</p>
              </div>
              {item.subtitle && <p className="mt-0.5 text-xs text-ink/40">{item.subtitle}</p>}
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default RankedBarList;