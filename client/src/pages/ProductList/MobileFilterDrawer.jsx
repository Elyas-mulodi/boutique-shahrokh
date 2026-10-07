import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import FilterPanel from "./FilterPanel";

function MobileFilterDrawer({ open, onClose, ...filterProps }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 z-50 md:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 right-0 left-0 bg-paper rounded-t-3xl z-50 md:hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-ink/10 sticky top-0 bg-paper">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-ink" />
                <span className="font-heading font-bold text-ink">فیلترها</span>
              </div>
              <button onClick={onClose} aria-label="بستن">
                <X size={22} className="text-ink" />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel {...filterProps} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileFilterDrawer;