import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center text-ink disabled:opacity-30 hover:bg-ink hover:text-paper transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {pageNumbers.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="relative w-9 h-9 rounded-full flex items-center justify-center font-body text-sm"
        >
          {page === n && (
            <motion.span
              layoutId="activePage"
              className="absolute inset-0 bg-ink rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <span className={`relative z-10 ${page === n ? "text-paper" : "text-ink/60 hover:text-ink"}`}>{n}</span>
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center text-ink disabled:opacity-30 hover:bg-ink hover:text-paper transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}

export default Pagination;