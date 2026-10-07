import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Grid2x2, ArrowUpLeft } from "lucide-react";
import CategoryShowcaseSkeleton from "./CategoryShowcaseSkeleton";
import ErrorState from "./ErrorState";
import { fetchCategories } from "../redux/slices/categorySlice";

function CategoryShowcase() {
  const dispatch = useDispatch();
  const { items: categories, status } = useSelector(
    (state) => state.categories,
  );

  if (status === "loading" || status === "idle") {
    return (
      <section className="py-10">
        <h2 className="font-heading text-ink text-xl md:text-2xl font-bold mb-6">
          دسته‌بندی‌ها
        </h2>
        <CategoryShowcaseSkeleton />
      </section>
    );
  }

  if (status === "failed") {
    return (
      <section className="py-10">
        <h2 className="font-heading text-ink text-xl md:text-2xl font-bold mb-6">
          دسته‌بندی‌ها
        </h2>
        <ErrorState
          message="خطا در دریافت دسته‌بندی‌ها"
          onRetry={() => dispatch(fetchCategories())}
        />
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  const [featured, ...rest] = categories;

  return (
    <section className="py-10">
      <h2 className="font-heading text-ink text-xl md:text-2xl font-bold mb-6">
        دسته‌بندی‌ها
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[160px]">
        {/* کارت برجسته - بزرگ‌تر از بقیه */}
        {featured && (
          <Link
            to={`/category/${featured.slug}`}
            className="col-span-2 row-span-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full h-full rounded-2xl overflow-hidden bg-ink"
            >
              {featured.image ? (
                <motion.img
                  src={featured.image}
                  alt={featured.name}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 bg-ink/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

              {/* خط گوشه که موقع هاور رسم میشه */}
              <div className="absolute top-4 left-4 w-6 h-[1.5px] bg-paper/70 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              <div className="absolute top-4 left-4 w-[1.5px] h-6 bg-paper/70 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />

              <div className="absolute bottom-0 right-0 left-0 p-5 flex items-end justify-between">
                <span className="font-heading text-paper text-2xl md:text-3xl font-bold">
                  {featured.name}
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="text-paper"
                >
                  <ArrowUpLeft size={22} />
                </motion.span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* بقیه دسته‌بندی‌ها - کوچیک‌تر */}
        {rest.map((cat) => (
          <Link key={cat._id} to={`/category/${cat.slug}`} className="group">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full rounded-2xl overflow-hidden bg-ink/10"
            >
              {cat.image ? (
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-ink/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />

              <div className="absolute bottom-0 right-0 left-0 p-3">
                <span className="font-heading text-paper text-sm md:text-base font-bold">
                  {cat.name}
                </span>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* کارت «همه دسته‌بندی‌ها» */}
        <Link to="/products" className="group">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full h-full rounded-2xl border-2 border-dashed border-ink/20 group-hover:border-blue flex flex-col items-center justify-center gap-2 transition-colors duration-300"
          >
            <Grid2x2
              size={22}
              className="text-ink/50 group-hover:text-blue transition-colors"
            />
            <span className="font-body text-ink/70 group-hover:text-blue text-xs md:text-sm transition-colors text-center px-2">
              همه دسته‌بندی‌ها
            </span>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}

export default CategoryShowcase;
