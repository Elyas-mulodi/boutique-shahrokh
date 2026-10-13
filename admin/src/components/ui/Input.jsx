import { useId } from "react";

function Input({ label, error, hint, className = "", containerClassName = "", id, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm text-ink/70">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue disabled:bg-ink/5 disabled:text-ink/40 ${
          error ? "border-red-500" : "border-ink/15"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink/40">{hint}</p>
      ) : null}
    </div>
  );
}

export default Input;