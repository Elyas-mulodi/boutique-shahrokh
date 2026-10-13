import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const sizes = {
  sm: "md:max-w-sm",
  md: "md:max-w-lg",
  lg: "md:max-w-2xl",
  xl: "md:max-w-4xl",
};

// پشته‌ی مودال‌های باز
const openModals = [];

function Modal({ open, onClose, title, children, footer, size = "md", closeOnBackdrop = true, dismissible = true }) {
  const id = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    openModals.push(id);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && dismissible && openModals[openModals.length - 1] === id) {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const index = openModals.indexOf(id);
      if (index !== -1) openModals.splice(index, 1);
    };
  }, [open, id, dismissible]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-4"
        >
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={closeOnBackdrop && dismissible ? onClose : undefined}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:rounded-2xl ${sizes[size]}`}
          >
            <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
              <h2 id={`${id}-title`} className="font-heading font-bold text-ink">
                {title}
              </h2>
              {dismissible && (
                <button onClick={onClose} aria-label="بستن" className="text-ink/40 transition-colors hover:text-ink">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div
                className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-ink/10 px-6 py-4"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;