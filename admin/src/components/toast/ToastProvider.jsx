import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContext";

const styles = {
  success: { icon: CheckCircle2, iconClass: "text-green-600" },
  error: { icon: XCircle, iconClass: "text-red-600" },
  info: { icon: Info, iconClass: "text-blue" },
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      timers.current.set(id, setTimeout(() => remove(id), duration));
    },
    [remove]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => push("success", message, 4000),
      error: (message) => push("error", message, 6000),
      info: (message) => push("info", message, 4000),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:left-6 md:top-auto md:items-start">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, iconClass } = styles[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-xl"
              >
                <Icon size={20} className={`mt-0.5 flex-shrink-0 ${iconClass}`} />
                <p className="flex-1 text-sm leading-6 text-ink">{toast.message}</p>
                <button
                  onClick={() => remove(toast.id)}
                  aria-label="بستن"
                  className="flex-shrink-0 text-ink/30 transition-colors hover:text-ink"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;