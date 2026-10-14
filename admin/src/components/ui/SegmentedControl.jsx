import { useId } from "react";
import { motion } from "framer-motion";

function SegmentedControl({ options, value, onChange, size = "md", ariaLabel }) {
  const uid = useId().replace(/:/g, "");
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-xl bg-ink/5 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative whitespace-nowrap rounded-lg font-bold transition-colors ${padding} ${
              active ? "text-paper" : "text-ink/60 hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${uid}`}
                className="absolute inset-0 rounded-lg bg-ink"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;