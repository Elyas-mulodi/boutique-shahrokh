import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { getProductBySlug } from "../../services/productApi";
import { addToCart } from "../../services/cartApi";
import ErrorState from "../../components/ErrorState";
import Gallery from "./Gallery";
import VariantSelector from "./VariantSelector";
import StickyAddBar from "./StickyAddBar";
import { useDispatch } from "react-redux";
import { fetchCart } from "../../redux/slices/cartSlice";

function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-[3/4] bg-ink/10 rounded-2xl" />
      <div className="space-y-4">
        <div className="h-4 bg-ink/10 rounded w-1/3" />
        <div className="h-8 bg-ink/10 rounded w-2/3" />
        <div className="h-6 bg-ink/10 rounded w-1/4" />
        <div className="h-24 bg-ink/10 rounded" />
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  const [barVisible, setBarVisible] = useState(false);
  const addButtonRef = useRef(null);
  const dispatch = useDispatch();

  const fetchProduct = () => {
    setStatus("loading");
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res.data.data);
        setStatus("succeeded");
      })
      .catch(() => setStatus("failed"));
  };

  useEffect(() => {
    fetchProduct();
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [slug]);

  useEffect(() => {
    if (!addButtonRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      {
        threshold: 0,
      },
    );
    observer.observe(addButtonRef.current);
    return () => observer.disconnect();
  }, [status]);

  if (status === "loading")
    return (
      <div className="py-10">
        <ProductDetailSkeleton />
      </div>
    );
  if (status === "failed")
    return (
      <div className="py-16">
        <ErrorState message="خطا در دریافت محصول" onRetry={fetchProduct} />
      </div>
    );
  if (!product) return null;

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  );
  const canAdd = selectedVariant && selectedVariant.stock >= quantity;
  const maxQty = selectedVariant?.stock || 1;

  const handleAddToCart = async () => {
    if (!canAdd) return;
    setAdding(true);
    setAddMessage(null);
    try {
      await addToCart({
        product: product._id,
        variantId: selectedVariant._id,
        quantity,
      });
      dispatch(fetchCart());
      setAddMessage({ type: "success", text: "به سبد خرید اضافه شد" });
    } catch (err) {
      const status = err?.response?.status;
      setAddMessage({
        type: "error",
        text:
          status === 401
            ? "ابتدا وارد حساب کاربری شوید"
            : "خطا در افزودن به سبد خرید",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="py-8 md:py-10 pb-28 md:pb-10">
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-body text-ink/50 mb-6">
        <Link to="/" className="hover:text-ink transition-colors">
          خانه
        </Link>
        <ChevronLeft size={12} />
        {product.category?.name && (
          <>
            <Link
              to={`/category/${product.category.slug}`}
              className="hover:text-ink transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronLeft size={12} />
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <Gallery images={product.images} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-heading text-ink text-2xl md:text-3xl font-bold">
            {product.name}
          </h1>
          <p className="font-heading text-ink text-xl font-bold mt-3">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>

          {product.description && (
            <p className="font-body text-ink/60 text-sm leading-7 mt-4">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <VariantSelector
              variants={product.variants}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onSelectColor={setSelectedColor}
              onSelectSize={setSelectedSize}
            />
          </div>

          {/* تعداد */}
          <div className="mt-6">
            <h3 className="font-body font-bold text-ink text-sm mb-3">تعداد</h3>
            <div className="inline-flex items-center border border-ink/15 rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-ink disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-body text-ink">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-ink disabled:opacity-30"
                disabled={quantity >= maxQty}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* دکمه افزودن - دسکتاپ و رفرنس برای تشخیص اسکرول */}
          <div ref={addButtonRef} className="mt-7">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || adding}
              className="w-full md:w-auto md:px-10 flex items-center justify-center gap-2 bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors disabled:opacity-40"
            >
              <ShoppingBag size={18} />
              {!selectedColor || !selectedSize
                ? "رنگ و سایز را انتخاب کنید"
                : adding
                  ? "در حال افزودن..."
                  : "افزودن به سبد خرید"}
            </button>

            {addMessage && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-body mt-2 ${addMessage.type === "success" ? "text-blue" : "text-red-500"}`}
              >
                {addMessage.text}
              </motion.p>
            )}
          </div>

          {/* بج‌های اطمینان */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-ink/10">
            {[
              { icon: Truck, text: "ارسال سریع" },
              { icon: RotateCcw, text: "۷ روز مهلت بازگشت" },
              { icon: ShieldCheck, text: "پرداخت امن" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <Icon size={18} className="text-ink/50" />
                <span className="font-body text-[11px] text-ink/50">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <StickyAddBar
        visible={barVisible && canAdd}
        price={product.price}
        onAdd={handleAddToCart}
        disabled={adding}
      />
    </div>
  );
}

export default ProductDetailPage;
