import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "../../utils/format";

function buildPages(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const wanted = new Set([1, 2, pages - 1, pages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push(`gap-${n}`);
    result.push(n);
  });
  return result;
}

function Pagination({ page, pages, total, onChange }) {
  if (!pages || pages <= 1) return null;

  const items = buildPages(page, pages);
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-xl border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink";

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-ink/50">
        {total !== undefined && `${formatNumber(total)} مورد • `}صفحه {formatNumber(page)} از {formatNumber(pages)}
      </p>

      <nav aria-label="صفحه‌بندی" className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="صفحه قبل" className={arrow}>
          <ChevronRight size={16} />
        </button>

        {items.map((item) =>
          typeof item === "string" ? (
            <span key={item} className="px-1 text-ink/30">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-xl px-2 text-sm transition-colors ${
                item === page ? "bg-ink font-bold text-paper" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {formatNumber(item)}
            </button>
          )
        )}

        <button onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="صفحه بعد" className={arrow}>
          <ChevronLeft size={16} />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;