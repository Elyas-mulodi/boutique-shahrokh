import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check, X } from "lucide-react";
import { previewCoupon } from "../../services/couponApi";

function CouponInput({ onApplied, onRemoved, appliedCoupon }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await previewCoupon(code);
      onApplied({ code: code.toUpperCase(), ...res.data.data });
    } catch (err) {
      setError(err?.response?.data?.message || "کد تخفیف معتبر نیست");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-blue/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-blue font-body text-sm">
          <Check size={15} />
          کد «{appliedCoupon.code}» اعمال شد
        </div>
        <button onClick={onRemoved} className="text-ink/40 hover:text-red-500 transition-colors">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد تخفیف"
            className="w-full border border-ink/15 rounded-xl pr-9 pl-4 py-2.5 font-body text-sm text-ink outline-none focus:border-blue transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!code || loading}
          className="bg-ink text-paper font-body text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue transition-colors disabled:opacity-40"
        >
          {loading ? "..." : "اعمال"}
        </button>
      </form>

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