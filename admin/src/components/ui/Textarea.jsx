import { useId } from "react";

function Textarea({ label, error, hint, className = "", containerClassName = "", id, rows = 5, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm text-ink/70">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue ${
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

export default Textarea;