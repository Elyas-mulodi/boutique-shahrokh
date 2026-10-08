import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

function PriceFilter({ minPrice, maxPrice, onApply }) {
  const [open, setOpen] = useState(false);
  const [fromVal, setFromVal] = useState(minPrice);
  const [toVal, setToVal] = useState(maxPrice);
  const [error, setError] = useState(null);
  const ref = useRef(null);
  const active = Boolean(minPrice || maxPrice);

  useEffect(() => {
    setFromVal(minPrice);
    setToVal(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleApply = () => {
    if (fromVal && toVal && Number(fromVal) > Number(toVal)) {
      setError("حداقل قیمت نباید از حداکثر بیشتر باشد");
      return;
    }
    setError(null);
    onApply(fromVal, toVal);
    setOpen(false);
  };

  const handleClear = () => {
    setError(null);
    setFromVal("");
    setToVal("");
    onApply("", "");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-body transition-colors ${
          active ? "border-blue text-blue" : "border-ink/15 text-ink hover:border-ink/30"
        }`}
      >
        قیمت
        {active && <span className="w-1.5 h-1.5 rounded-full bg-blue" />}
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
            className="absolute left-0 mt-2 w-72 bg-paper border border-ink/10 rounded-2xl shadow-xl p-4 z-20"
          >
            <p className="font-body font-bold text-ink text-sm mb-3">محدوده قیمت (تومان)</p>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="از"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                dir="ltr"
                className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm font-body outline-none focus:border-blue"
              />
              <span className="text-ink/30">—</span>
              <input
                type="number"
                min="0"
                placeholder="تا"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                dir="ltr"
                className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm font-body outline-none focus:border-blue"
              />
            </div>

            {error && <p className="font-body text-xs text-red-500 mt-2">{error}</p>}

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleApply}
                className="bg-ink text-paper font-body text-sm font-bold px-6 py-2 rounded-full hover:bg-blue transition-colors"
              >
                اعمال
              </button>
              {active && (
                <button onClick={handleClear} className="font-body text-sm text-ink/50 hover:text-blue transition-colors">
                  پاک‌کردن
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PriceFilter;