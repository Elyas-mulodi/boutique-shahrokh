import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Plus, RefreshCw, Shirt, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Switch from "../../components/ui/Switch";
import Thumb from "../../components/ui/Thumb";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import { deleteProduct, listProducts, updateProduct } from "../../services/productApi";
import { listAllCategories } from "../../services/categoryApi";
import { getErrorMessage } from "../../utils/error";
import { formatNumber, formatToman } from "../../utils/format";
import ProductFilters from "./ProductFilters";
import { getStockInfo } from "./productForm";

const PAGE_SIZE = 20;
const STATUS_VALUES = ["active", "inactive"];
const STOCK_VALUES = ["low", "out"];
const SORT_VALUES = ["newest", "oldest", "price_asc", "price_desc", "name"];
const OBJECT_ID = /^[0-9a-f]{24}$/i;

const iconAction =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink";

function ProductsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [overrides, setOverrides] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const from = `${location.pathname}${location.search}`;

  const rawPage = Number.parseInt(searchParams.get("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawCategory = searchParams.get("category") || "";
  const category = OBJECT_ID.test(rawCategory) ? rawCategory : "";
  const rawStatus = searchParams.get("status");
  const status = STATUS_VALUES.includes(rawStatus) ? rawStatus : "";
  const rawStock = searchParams.get("stock");
  const stock = STOCK_VALUES.includes(rawStock) ? rawStock : "";
  const rawSort = searchParams.get("sort");
  const sort = SORT_VALUES.includes(rawSort) ? rawSort : "newest";
  const urlSearch = searchParams.get("search") || "";

  const update = useCallback(
    (patch, options) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) next.delete(key);
          else next.set(key, String(value));
        });
        if (!("page" in patch)) next.delete("page"); // تغییر فیلتر = برگشت به صفحه ۱
        return next;
      }, options);
    },
    [setSearchParams]
  );

  // جستجو با تاخیر ۴۰۰ میلی‌ثانیه
  const [searchText, setSearchText] = useState(urlSearch);

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const normalized = searchText.trim() ? searchText : "";
    if (normalized === urlSearch) return undefined;
    const timer = setTimeout(() => update({ search: normalized }, { replace: true }), 400);
    return () => clearTimeout(timer);
  }, [searchText, urlSearch, update]);

  const handleChange = (patch) => update({ ...patch, ...("sort" in patch && patch.sort === "newest" ? { sort: "" } : {}) });

  const query = searchParams.toString();
  const categoriesState = useAsync(() => listAllCategories(), []);
  const products = useAsync(
    () => listProducts({ page, limit: PAGE_SIZE, search: urlSearch, category, status, stock, sort }),
    [query, refreshKey]
  );
  const data = products.data;

  // اگه صفحه از تعداد صفحات بیشتر شد (بعد از فیلتر یا حذف)، به آخرین صفحه برگرد
  useEffect(() => {
    if (data && data.pages && page > data.pages) {
      update({ page: data.pages > 1 ? data.pages : "" }, { replace: true });
    }
  }, [data, page, update]);

  const hasFilters = Boolean(urlSearch || category || status || stock || sort !== "newest");
  const clearFilters = () => setSearchParams({});

  const isActive = useCallback((p) => (p._id in overrides ? overrides[p._id] : p.isActive), [overrides]);

  const toggleActive = async (product) => {
    const next = !isActive(product);
    setOverrides((o) => ({ ...o, [product._id]: next }));

    try {
      await updateProduct(product._id, { isActive: next });
      toast.success(next ? "محصول فعال شد" : "محصول غیرفعال شد");
      await products.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت محصول"));
    } finally {
      setOverrides((o) => {
        const copy = { ...o };
        delete copy[product._id];
        return copy;
      });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteProduct(deleteTarget._id);
      toast.success(res?.message || "محصول حذف شد");
      setDeleteTarget(null);
      await products.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در حذف محصول"));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const editLink = (product) => ({ pathname: `/products/${product._id}/edit` });
  const stop = (e) => e.stopPropagation();

  const actions = (product) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={editLink(product)}
        state={{ from }}
        onClick={stop}
        aria-label="ویرایش"
        title="ویرایش"
        className={iconAction}
      >
        <Pencil size={17} />
      </Link>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setDeleteTarget(product);
        }}
        aria-label="حذف"
        title="حذف"
        className={`${iconAction} hover:bg-red-50 hover:text-red-600`}
      >
        <Trash2 size={17} />
      </button>
    </div>
  );

  const stockCell = (product) => {
    const info = getStockInfo(product.variants);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">{formatNumber(info.total)}</span>
        <Badge tone={info.tone}>{info.label}</Badge>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        key: "product",
        header: "محصول",
        render: (p) => (
          <div className="flex items-center gap-3">
            <Thumb key={p.images?.[0] || "none"} src={p.images?.[0]} alt="" className="h-14 w-11" />
            <div className="min-w-0">
              <p className="max-w-[260px] truncate font-bold">{p.name}</p>
              <p className="max-w-[260px] truncate text-xs text-ink/40" dir="ltr" style={{ textAlign: "right" }}>
                {p.slug}
              </p>
            </div>
          </div>
        ),
      },
      { key: "category", header: "دسته‌بندی", render: (p) => p.category?.name || <span className="text-ink/30">—</span> },
      { key: "price", header: "قیمت", render: (p) => <span className="font-bold">{formatToman(p.price)}</span> },
      { key: "stock", header: "موجودی", render: stockCell },
      {
        key: "status",
        header: "نمایش",
        render: (p) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive(p)}
              onChange={() => toggleActive(p)}
              loading={p._id in overrides}
              label={`فعال بودن ${p.name}`}
            />
            <span className="text-xs text-ink/50">{isActive(p) ? "فعال" : "غیرفعال"}</span>
          </div>
        ),
      },
      { key: "actions", header: "", align: "end", render: actions },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overrides, from]
  );

  const renderMobileCard = (p) => {
    const info = getStockInfo(p.variants);
    return (
      <div className="flex gap-3 p-4">
        <Thumb key={p.images?.[0] || "none"} src={p.images?.[0]} alt="" className="h-20 w-16" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{p.name}</p>
          <p className="truncate text-xs text-ink/40">{p.category?.name || "—"}</p>
          <p className="mt-1 text-sm font-bold text-ink">{formatToman(p.price)}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={info.tone}>{info.label}</Badge>
            <span className="text-xs text-ink/50">{formatNumber(info.total)} عدد</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive(p)}
                onChange={() => toggleActive(p)}
                loading={p._id in overrides}
                label={`فعال بودن ${p.name}`}
              />
              <span className="text-xs text-ink/50">{isActive(p) ? "فعال" : "غیرفعال"}</span>
            </div>
            {actions(p)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="محصولات"
        description={data ? `${formatNumber(data.total)} محصول` : undefined}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
              بروزرسانی
            </Button>
            <Link
              to="/products/new"
              state={{ from }}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-paper transition-colors hover:bg-blue"
            >
              <Plus size={16} />
              افزودن محصول
            </Link>
          </>
        }
      />

      <Card className="mb-4">
        <ProductFilters
          filters={{ category, status, stock, sort }}
          searchText={searchText}
          onSearchText={setSearchText}
          categoriesState={categoriesState}
          onChange={handleChange}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />
      </Card>

      <div className={products.loading && data ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <DataTable
          columns={columns}
          rows={data?.products || []}
          loading={products.loading && !data}
          error={Boolean(products.error)}
          errorMessage={products.error}
          onRetry={products.reload}
          emptyTitle={hasFilters ? "محصولی با این فیلترها پیدا نشد" : "هنوز محصولی اضافه نشده است"}
          emptyDescription={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید." : "اولین محصول فروشگاه را بسازید."}
          emptyAction={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                پاک‌کردن فیلترها
              </Button>
            ) : (
              <Link
                to="/products/new"
                state={{ from }}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-paper transition-colors hover:bg-blue"
              >
                <Shirt size={16} />
                افزودن محصول
              </Link>
            )
          }
          renderMobileCard={renderMobileCard}
          onRowClick={(p) => navigate(`/products/${p._id}/edit`, { state: { from } })}
        />
      </div>

      {data && !products.error && (
        <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => update({ page: p })} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        title="حذف محصول"
        message={`«${deleteTarget?.name || ""}» برای همیشه حذف می‌شود (همراه با تصاویرش) و از سبد خرید مشتریان برداشته می‌شود. اگر در سفارش‌های پرداخت‌شده ثبت شده باشد، حذف انجام نمی‌شود و باید آن را غیرفعال کنید.`}
        confirmLabel="حذف محصول"
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default ProductsPage;