import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, TrendingUp } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ErrorState from "./ErrorState";
import { fetchBestSellers } from "../redux/slices/productSlice";

function BestSellersSection() {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { bestSellers, bestSellersStatus, bestSellersError } = useSelector(
    (state) => state.products,
  );

  const scrollByAmount = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "next" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const loading =
    bestSellersStatus === "loading" || bestSellersStatus === "idle";
  const error = bestSellersStatus === "failed";

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue" />
          <h2 className="font-heading text-ink text-xl md:text-2xl font-bold">
            پرفروش‌ترین‌ها
          </h2>
        </div>

        {/* دکمه‌های ناوبری - فقط دسکتاپ */}
        {!loading && !error && bestSellers.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollByAmount("prev")}
              className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
              aria-label="قبلی"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => scrollByAmount("next")}
              className="w-9 h-9 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
              aria-label="بعدی"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>

      {error ? (
        <ErrorState
          message="خطا در دریافت پرفروش‌ترین‌ها"
          onRetry={() => dispatch(fetchBestSellers())}
        />
      ) : loading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[46%] sm:w-[230px] flex-shrink-0">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : bestSellers.length === 0 ? (
        <p className="text-center text-ink/50 font-body py-12">
          هنوز داده‌ی فروشی ثبت نشده است
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
        >
          {bestSellers.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="w-[46%] sm:w-[230px] flex-shrink-0 snap-start relative"
            >
              {/* رتبه پرفروش روی کارت */}
              <span className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-ink text-paper text-xs font-bold flex items-center justify-center font-body">
                {i + 1}
              </span>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

export default BestSellersSection;
