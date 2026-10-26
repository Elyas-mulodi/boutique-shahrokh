import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check, X } from "lucide-react";
import { previewCoupon } from "../../services/couponApi";


const normalizeCode = (value) =>
  value
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/\s+/g, "")
    .toUpperCase();

function CouponInput({ onApplied, onRemoved, appliedCoupon }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async () => {
    if (loading) return;

    const value = normalizeCode(code);
    if (value.length < 3) {
      setError("کد تخفیف را وارد کنید");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await previewCoupon(value);
      onApplied({ code: value, ...res.data.data });
      setCode("");
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.errors?.[0]?.message || data?.message || "خطا در بررسی کد تخفیف",
      );
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between gap-3 bg-blue/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-blue font-body text-sm min-w-0">
          <Check size={15} className="flex-shrink-0" />
          <span className="truncate">
            کد «{appliedCoupon.code}» اعمال شد •{" "}
            {appliedCoupon.discountAmount.toLocaleString("fa-IR")} تومان تخفیف
          </span>
        </div>
        <button
          type="button"
          onClick={onRemoved}
          aria-label="حذف کد تخفیف"
          className="text-ink/40 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30"
          />
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // جلوگیری از ثبت سفارش با Enter
                handleApply();
              }
            }}
            placeholder="کد تخفیف"
            aria-label="کد تخفیف"
            dir="ltr"
            autoComplete="off"
            className="w-full border border-ink/15 rounded-xl pr-9 pl-4 py-2.5 font-body text-sm text-ink outline-none focus:border-blue transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || loading}
          className="bg-ink text-paper font-body text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue transition-colors disabled:opacity-40"
        >
          {loading ? "..." : "اعمال"}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-body text-red-500 mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
