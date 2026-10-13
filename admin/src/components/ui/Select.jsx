import { useId } from "react";
import { ChevronDown } from "lucide-react";

function Select({ label, error, hint, children, className = "", containerClassName = "", id, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm text-ink/70">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full appearance-none rounded-xl border bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-blue disabled:bg-ink/5 disabled:text-ink/40 ${
            error ? "border-red-500" : "border-ink/15"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink/40">{hint}</p>
      ) : null}
    </div>
  );
}

export default Select;