import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { getProducts } from "../../services/productApi";
import ProductGrid from "../../components/ProductGrid";
import FilterPanel from "./FilterPanel";
import MobileFilterDrawer from "./MobileFilterDrawer";
import SortDropdown from "./SortDropdown";
import Pagination from "./Pagination";

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [status, setStatus] = useState("loading");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const search = searchParams.get("search") || "";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page"); // تغییر فیلتر = برگشت به صفحه ۱
    setSearchParams(next);
  };

  // پاک‌کردن فیلترها (عبارت جستجو حفظ میشه، چون کاربر عمداً اون رو وارد کرده)
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    setSearchParams(next);
  };

  const fetchData = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await getProducts({ page, limit: 12, category, sort, minPrice, maxPrice, search });
      setProducts(res.data.data.products);
      setMeta({
        total: res.data.data.total,
        page: res.data.data.page,
        pages: res.data.data.pages,
      });
      setStatus("succeeded");
    } catch {
      setStatus("failed");
    }
  }, [page, category, sort, minPrice, maxPrice, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterProps = {
    selectedCategory: category,
    onCategoryChange: (val) => updateParam("category", val),
    minPrice,
    maxPrice,
    onPriceChange: (type, val) => updateParam(type === "min" ? "minPrice" : "maxPrice", val),
    onClear: clearFilters,
  };

  return (
    <div className="py-8 md:py-10">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-ink text-2xl font-bold">
            {search ? "نتایج جستجو" : "همه محصولات"}
          </h1>

          {search && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-ink/5 rounded-full pl-2 pr-3.5 py-1 text-sm font-body text-ink max-w-full">
                <span className="truncate">«{search}»</span>
                <button
                  onClick={() => updateParam("search", "")}
                  aria-label="حذف عبارت جستجو"
                  className="w-5 h-5 rounded-full flex items-center justify-center text-ink/50 hover:bg-ink hover:text-paper transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          {status === "succeeded" && (
            <p className="font-body text-ink/50 text-sm mt-1.5">
              {meta.total.toLocaleString("fa-IR")} محصول
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center gap-1.5 border border-ink/15 rounded-full px-4 py-2 text-sm font-body text-ink"
          >
            <SlidersHorizontal size={15} />
            فیلتر
          </button>
          <SortDropdown value={sort} onChange={(val) => updateParam("sort", val)} />
        </div>
      </div>

      <div className="flex gap-10">
        {/* سایدبار فیلتر - دسکتاپ */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FilterPanel {...filterProps} />
        </aside>

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            loading={status === "loading"}
            error={status === "failed"}
            onRetry={fetchData}
          />
          <Pagination
            page={meta.page}
            pages={meta.pages}
            onChange={(p) => updateParam("page", p)}
          />
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        {...filterProps}
      />
    </div>
  );
}

export default ProductListPage;