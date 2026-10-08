import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getCategoryBySlug } from "../../services/categoryApi";
import { getProducts } from "../../services/productApi";
import ProductGrid from "../../components/ProductGrid";
import ErrorState from "../../components/ErrorState";
import SortDropdown from "../ProductList/SortDropdown";
import Pagination from "../ProductList/Pagination";
import CategoryHeader from "./CategoryHeader";
import SubCategoryChips from "./SubCategoryChips";
import PriceFilter from "./PriceFilter";

function CategoryPageSkeleton() {
  return (
    <div className="py-8 md:py-10">
      <div className="animate-pulse h-4 w-48 bg-ink/10 rounded mb-6" />
      <div className="animate-pulse h-40 md:h-56 rounded-3xl bg-ink/10" />
      <div className="mt-8">
        <ProductGrid products={[]} loading skeletonCount={8} />
      </div>
    </div>
  );
}

function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null); // { category, children, ancestors }
  const [catStatus, setCatStatus] = useState("loading"); // loading | succeeded | notfound | failed
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [prodStatus, setProdStatus] = useState("loading");
  const requestId = useRef(0);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const isStale = data?.category?.slug !== slug;
  const showSkeleton = catStatus === "loading" || (catStatus === "succeeded" && isStale);
  const categoryId = catStatus === "succeeded" && !isStale ? data.category._id : null;

  const fetchCategory = useCallback(async () => {
    setCatStatus("loading");
    try {
      const res = await getCategoryBySlug(slug);
      setData(res.data.data);
      setCatStatus("succeeded");
    } catch (err) {
      setCatStatus(err?.response?.status === 404 ? "notfound" : "failed");
    }
  }, [slug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const fetchProducts = useCallback(async () => {
    if (!categoryId) return;
    const id = ++requestId.current;
    setProdStatus("loading");
    try {
      const res = await getProducts({
        page,
        limit: 12,
        category: categoryId,
        sort,
        minPrice,
        maxPrice,
      });
      if (id !== requestId.current) return; // پاسخ کهنه
      setProducts(res.data.data.products);
      setMeta({
        total: res.data.data.total,
        page: res.data.data.page,
        pages: res.data.data.pages,
      });
      setProdStatus("succeeded");
    } catch {
      if (id !== requestId.current) return;
      setProdStatus("failed");
    }
  }, [categoryId, page, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // با تغییر صفحه‌بندی، به بالای صفحه برگرد
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!("page" in patch)) next.delete("page"); // تغییر فیلتر = برگشت به صفحه ۱
    setSearchParams(next);
  };

  if (showSkeleton) return <CategoryPageSkeleton />;

  if (catStatus === "notfound") {
    return (
      <div className="py-20 flex flex-col items-center text-center gap-4">
        <p className="font-heading text-ink text-xl font-bold">دسته‌بندی پیدا نشد</p>
        <p className="font-body text-ink/60 text-sm">ممکن است این دسته‌بندی حذف یا غیرفعال شده باشد.</p>
        <Link
          to="/products"
          className="bg-ink text-paper font-body font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          مشاهده همه محصولات
        </Link>
      </div>
    );
  }

  if (catStatus === "failed" || !data) {
    return (
      <div className="py-16">
        <ErrorState message="خطا در دریافت دسته‌بندی" onRetry={fetchCategory} />
      </div>
    );
  }

  const { category, children, ancestors } = data;

  return (
    <div className="py-8 md:py-10">
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-body text-ink/50 mb-6 flex-wrap">
        <Link to="/" className="hover:text-ink transition-colors">
          خانه
        </Link>
        {ancestors.map((a) => (
          <span key={a._id} className="flex items-center gap-1.5">
            <ChevronLeft size={12} />
            <Link to={`/category/${a.slug}`} className="hover:text-ink transition-colors">
              {a.name}
            </Link>
          </span>
        ))}
        <ChevronLeft size={12} />
        <span className="text-ink">{category.name}</span>
      </div>

      <CategoryHeader key={category._id} category={category} />

      {children.length > 0 && (
        <div className="mt-6">
          <SubCategoryChips items={children} />
        </div>
      )}

      {/* نوار ابزار */}
      <div className="flex items-center justify-between gap-3 mt-6 mb-6">
        <p className="font-body text-ink/50 text-sm">
          {prodStatus === "succeeded" ? `${meta.total.toLocaleString("fa-IR")} محصول` : "\u00A0"}
        </p>

        <div className="flex items-center gap-2">
          <SortDropdown value={sort} onChange={(val) => updateParams({ sort: val })} />
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onApply={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
          />
        </div>
      </div>

      <ProductGrid
        products={products}
        loading={prodStatus === "loading"}
        error={prodStatus === "failed"}
        onRetry={fetchProducts}
      />

      <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParams({ page: p })} />
    </div>
  );
}

export default CategoryPage;