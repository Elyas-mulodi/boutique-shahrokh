import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber } from "../../utils/format";

function ChangeBadge({ change }) {
  if (change === null || change === undefined) {
    return (
      <span className="text-xs text-ink/30" title="دوره قبل داده‌ای برای مقایسه نداشته">
        —
      </span>
    );
  }

  const up = change > 0;
  const down = change < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const tone = up ? "bg-green-50 text-green-700" : down ? "bg-red-50 text-red-600" : "bg-ink/5 text-ink/50";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}
      title="در مقایسه با دوره قبل"
    >
      <Icon size={12} />
      {formatNumber(Math.abs(change))}٪
    </span>
  );
}

export default ChangeBadge;