import { motion, AnimatePresence } from "framer-motion";

function StickyAddBar({ visible, price, onAdd, disabled }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 right-0 left-0 z-40 md:hidden bg-paper border-t border-ink/10 p-4 flex items-center justify-between gap-4"
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <span className="font-heading text-ink font-bold text-lg whitespace-nowrap">
            {price.toLocaleString("fa-IR")} تومان
          </span>
          <button
            onClick={onAdd}
            disabled={disabled}
            className="flex-1 bg-ink text-paper font-body font-bold py-3 rounded-full disabled:opacity-40"
          >
            افزودن به سبد
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyAddBar;
