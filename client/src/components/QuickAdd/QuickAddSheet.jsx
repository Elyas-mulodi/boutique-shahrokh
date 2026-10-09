import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, CheckCircle2, ImageOff } from "lucide-react";
import { addToCart } from "../../services/cartApi";
import { fetchCart } from "../../redux/slices/cartSlice";
import { logout } from "../../redux/slices/authSlice";
import VariantSelector from "../../pages/ProductDetail/VariantSelector";

function QuickAddSheet({ product, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);

  const variants = product.variants || [];
  const available = useMemo(() => variants.filter((v) => v.stock > 0), [variants]);
  const colors = useMemo(() => [...new Set(available.map((v) => v.color))], [available]);
  const sizes = useMemo(() => [...new Set(available.map((v) => v.size))], [available]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  // با هر بار باز شدن، انتخاب‌ها ریست میشن؛ اگه فقط یک گزینه موجود باشه خودکار انتخاب میشه
  useEffect(() => {
    if (!open) return;
    setSelectedColor(colors.length === 1 ? colors[0] : null);
    setSelectedSize(sizes.length === 1 ? sizes[0] : null);
    setQuantity(1);
    setError(null);
    setAdded(false);
  }, [open, colors, sizes]);

  // قفل اسکرول صفحه + بستن با Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const maxQty = selectedVariant?.stock || 1;
  const canAdd = Boolean(selectedVariant) && selectedVariant.stock >= quantity;

  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQty));
  }, [maxQty]);

  const handleAdd = async () => {
    if (!canAdd) return;

    if (!token) {
      onClose();
      navigate("/account", { state: { from: location } });
      return;
    }

    setAdding(true);
    setError(null);
    try {
      await addToCart({ product: product._id, variantId: selectedVariant._id, quantity });
      dispatch(fetchCart());
      setAdded(true);
    } catch (err) {
      if (err?.response?.status === 401) {
        dispatch(logout());
        onClose();
        navigate("/account", { state: { from: location } });
        return;
      }
      setError(err?.response?.data?.message || "خطا در افزودن به سبد خرید");
    } finally {
      setAdding(false);
    }
  };

  let buttonLabel = "افزودن به سبد خرید";
  if (adding) buttonLabel = "در حال افزودن...";
  else if (!selectedColor || !selectedSize) buttonLabel = "رنگ و سایز را انتخاب کنید";
  else if (!selectedVariant) buttonLabel = "این ترکیب موجود نیست";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
        >
          <div className="absolute inset-0 bg-ink/50" onClick={onClose} />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full md:max-w-md bg-paper rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-ink/5 flex items-center justify-center flex-shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={18} className="text-ink/25" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-bold text-ink text-sm line-clamp-2">{product.name}</h3>
                <p className="font-heading font-bold text-ink mt-1.5">
                  {product.price.toLocaleString("fa-IR")} تومان
                </p>
              </div>
              <button onClick={onClose} aria-label="بستن" className="text-ink/50 hover:text-ink transition-colors">
                <X size={22} />
              </button>
            </div>

            {added ? (
              <div className="py-4 flex flex-col items-center text-center gap-3">
                <CheckCircle2 size={44} className="text-blue" strokeWidth={1.5} />
                <p className="font-heading font-bold text-ink">به سبد خرید اضافه شد</p>
                <div className="flex items-center gap-3 mt-3 w-full">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="flex-1 text-center bg-ink text-paper font-body font-bold py-3 rounded-full hover:bg-blue transition-colors"
                  >
                    مشاهده سبد خرید
                  </Link>
                  <button
                    onClick={onClose}
                    className="flex-1 border border-ink/15 text-ink font-body py-3 rounded-full hover:border-ink transition-colors"
                  >
                    ادامه خرید
                  </button>
                </div>
              </div>
            ) : (
              <>
                <VariantSelector
                  variants={variants}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  onSelectColor={setSelectedColor}
                  onSelectSize={setSelectedSize}
                  idPrefix={`qa-${product._id}`}
                />

                <div className="mt-6 flex items-center justify-between">
                  <div className="inline-flex items-center border border-ink/15 rounded-full">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-ink disabled:opacity-30"
                      aria-label="کم‌کردن"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center font-body text-ink">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="w-10 h-10 flex items-center justify-center text-ink disabled:opacity-30"
                      aria-label="زیاد‌کردن"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {selectedVariant && selectedVariant.stock <= 3 && (
                    <span className="font-body text-xs text-red-500">
                      تنها {selectedVariant.stock.toLocaleString("fa-IR")} عدد باقی مانده
                    </span>
                  )}
                </div>

                {error && <p className="font-body text-sm text-red-500 mt-4">{error}</p>}

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!canAdd || adding}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors disabled:opacity-40"
                >
                  <ShoppingBag size={18} />
                  {buttonLabel}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default QuickAddSheet;