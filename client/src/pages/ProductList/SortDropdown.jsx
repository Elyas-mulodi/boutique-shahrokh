import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

const options = [
  { value: "", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-ink/15 rounded-full px-4 py-2 text-sm font-body text-ink hover:border-ink/30 transition-colors"
      >
        {current.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-40 bg-paper border border-ink/10 rounded-xl shadow-lg overflow-hidden z-20"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-body text-ink hover:bg-ink/5 transition-colors"
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-blue" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SortDropdown;