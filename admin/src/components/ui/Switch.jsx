import Spinner from "./Spinner";

function Switch({ checked, onChange, disabled = false, loading = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || loading}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-blue" : "bg-ink/20"
      }`}
    >
      <span
        className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all ${
          checked ? "right-[22px]" : "right-0.5"
        }`}
      >
        {loading && <Spinner size={11} className="text-ink/50" />}
      </span>
    </button>
  );
}

export default Switch;