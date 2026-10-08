import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ErrorState from "../ErrorState";
import { fetchCategories } from "../../redux/slices/categorySlice";

function MegaMenuSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] rounded-xl bg-ink/10" />
          <div className="h-4 bg-ink/10 rounded w-1/2" />
          <div className="h-3 bg-ink/10 rounded w-3/4" />
          <div className="h-3 bg-ink/10 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function MegaMenu({ categories, status, onNavigate }) {
  const dispatch = useDispatch();
  const isLoading = status === "loading" || status === "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full right-0 left-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-paper border border-ink/10 rounded-b-3xl shadow-xl p-8">
          {isLoading ? (
            <MegaMenuSkeleton />
          ) : status === "failed" ? (
            <ErrorState message="خطا در دریافت دسته‌بندی‌ها" onRetry={() => dispatch(fetchCategories())} />
          ) : categories.length === 0 ? (
            <p className="text-center text-ink/50 font-body py-6">دسته‌بندی‌ای یافت نشد</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((cat) => (
                  <div key={cat._id}>
                    <Link to={`/category/${cat.slug}`} onClick={onNavigate} className="group block">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-ink/5 mb-3">
                        {cat.image && (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <span className="font-heading font-bold text-ink group-hover:text-blue transition-colors">
                        {cat.name}
                      </span>
                    </Link>

                    {cat.children?.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {cat.children.map((child) => (
                          <li key={child._id}>
                            <Link
                              to={`/category/${child.slug}`}
                              onClick={onNavigate}
                              className="font-body text-sm text-ink/60 hover:text-blue transition-colors"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/10 mt-6 pt-4 flex justify-end">
                <Link
                  to="/products"
                  onClick={onNavigate}
                  className="flex items-center gap-1 text-blue text-sm font-body hover:gap-2 transition-all duration-200"
                >
                  مشاهده همه محصولات
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MegaMenu;