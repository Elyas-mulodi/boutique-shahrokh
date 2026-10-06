import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ImageOff } from "lucide-react";

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const {
    name,
    slug,
    price,
    discountPrice,
    images,
    colors = [],
    isNew,
  } = product;
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden bg-paper shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/product/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-ink/5">
          {images?.[0] ? (
            <>
              <motion.img
                src={images[0]}
                alt={name}
                animate={{
                  opacity: hovered && images?.[1] ? 0 : 1,
                  scale: hovered ? 1.06 : 1,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {images?.[1] && (
                <motion.img
                  src={images[1]}
                  alt={`${name} - دوم`}
                  animate={{
                    opacity: hovered ? 1 : 0,
                    scale: hovered ? 1.06 : 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/5 text-ink/30">
              <ImageOff size={32} strokeWidth={1.5} />
              <span className="text-[11px] font-body">بدون تصویر</span>
            </div>
          )}

          {/* بج گوشه با شکل مورب */}
          {(isNew || hasDiscount) && (
            <div
              className={`absolute top-3 right-[-28px] w-28 rotate-45 text-center py-1 text-[10px] font-body font-bold shadow-sm ${
                hasDiscount ? "bg-ink text-paper" : "bg-blue text-paper"
              }`}
            >
              {hasDiscount ? "تخفیف" : "جدید"}
            </div>
          )}

          {/* دکمه افزودن به سبد */}
          <motion.button
            initial={false}
            animate={{ y: hovered ? 0 : 60, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.preventDefault()}
            className="md:absolute hidden md:flex bottom-3 left-3 right-3 bg-ink text-paper font-body text-sm py-2.5 rounded-full items-center justify-center gap-2 hover:bg-blue transition-colors"
          >
            <ShoppingBag size={16} />
            افزودن به سبد
          </motion.button>
        </div>

        {/* اطلاعات محصول */}
        <div className="p-3">
          <h3 className="font-body text-ink text-sm line-clamp-1">{name}</h3>

          {/* قیمت */}
          <div className="flex items-center gap-2 mt-1.5">
            {hasDiscount ? (
              <>
                <span className="font-heading text-ink font-bold text-sm">
                  {discountPrice.toLocaleString("fa-IR")} تومان
                </span>
                <span className="relative text-ink/40 text-xs font-body">
                  {price.toLocaleString("fa-IR")}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="absolute left-0 right-0 top-1/2 h-[1px] bg-ink/50 origin-right"
                  />
                </span>
              </>
            ) : (
              <span className="font-heading text-ink font-bold text-sm">
                {price.toLocaleString("fa-IR")} تومان
              </span>
            )}
          </div>

          {/* دایره‌های رنگ - با هاور از پایین میان بالا (فقط دسکتاپ)، تو موبایل همیشه نمایش */}
          {colors.length > 0 && (
            <motion.div
              initial={false}
              animate={{
                opacity: hovered ? 1 : 0,
                y: hovered ? 0 : 10,
              }}
              transition={{ duration: 0.25 }}
              className="hidden md:flex items-center gap-1.5 mt-2"
            >
              {colors.map((c) => (
                <span
                  key={c}
                  className="w-3.5 h-3.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: c }}
                />
              ))}
            </motion.div>
          )}
          <div className="flex md:hidden items-center gap-1.5 mt-2">
            {colors.map((c) => (
              <span
                key={c}
                className="w-3.5 h-3.5 rounded-full border border-ink/15"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </Link>

      {/* دکمه افزودن به سبد - همیشه نمایش در موبایل */}
      <button
        onClick={(e) => e.preventDefault()}
        className="md:hidden w-full bg-ink text-paper font-body text-xs py-2.5 flex items-center justify-center gap-1.5"
      >
        <ShoppingBag size={14} />
        افزودن به سبد
      </button>
    </motion.div>
  );
}

export default ProductCard;
