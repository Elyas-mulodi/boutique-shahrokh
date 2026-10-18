import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Plus, RefreshCw, Search } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import { deleteCategory, listAllCategories, moveCategory, updateCategory } from "../../services/categoryApi";
import { getErrorMessage } from "../../utils/error";
import { MAX_CATEGORY_DEPTH, buildIndex, filterCategories, flattenCategories } from "../../utils/categories";
import { formatNumber } from "../../utils/format";
import CategoryRow from "./CategoryRow";
import CategoryModal from "./CategoryModal";

function ListSkeleton() {
  return (
    <div className="divide-y divide-ink/5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function CategoriesPage() {
  const toast = useToast();
  const categories = useAsync(() => listAllCategories(), []);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { key, open, category, parentId }
  const [overrides, setOverrides] = useState({});
  const [movingId, setMovingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const list = categories.data;
  const items = useMemo(() => list || [], [list]);
  const rows = useMemo(() => flattenCategories(items), [items]);
  const searching = Boolean(search.trim());
  const visibleRows = useMemo(() => filterCategories(rows, search), [rows, search]);

  // جایگاه هر دسته بین هم‌سطح‌هاش (برای فعال/غیرفعال بودن فلش‌ها)
  const positions = useMemo(() => {
    const map = new Map();
    buildIndex(items).childrenOf.forEach((siblings) => {
      siblings.forEach((c, index) => map.set(String(c._id), { index, count: siblings.length }));
    });
    return map;
  }, [items]);

  const isActive = useCallback((c) => (c._id in overrides ? overrides[c._id] : c.isActive), [overrides]);
  const activeCount = items.filter((c) => isActive(c)).length;

  const openCreate = (parentId = "") => setModal({ key: Date.now(), open: true, category: null, parentId });
  const openEdit = (category) => setModal({ key: Date.now(), open: true, category, parentId: "" });
  const closeModal = () => setModal((m) => (m ? { ...m, open: false } : m));
  const handleSaved = () => {
    closeModal();
    categories.reload();
  };

  const toggleActive = async (category) => {
    const next = !isActive(category);
    setOverrides((o) => ({ ...o, [category._id]: next }));

    try {
      await updateCategory(category._id, { isActive: next });
      toast.success(
        next
          ? "دسته‌بندی فعال شد"
          : category.childrenCount > 0
          ? "دسته‌بندی و زیردسته‌هایش از فروشگاه برداشته شدند"
          : "دسته‌بندی از فروشگاه برداشته شد"
      );
      await categories.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت دسته‌بندی"));
    } finally {
      setOverrides((o) => {
        const copy = { ...o };
        delete copy[category._id];
        return copy;
      });
    }
  };

  const move = async (category, direction) => {
    setMovingId(category._id);
    try {
      await moveCategory(category._id, direction);
      await categories.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر ترتیب"));
    } finally {
      setMovingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteCategory(deleteTarget._id);
      toast.success(res?.message || "دسته‌بندی حذف شد");
      setDeleteTarget(null);
      await categories.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در حذف دسته‌بندی"));
      setDeleteTarget(null);
      await categories.reload();
    } finally {
      setDeleting(false);
    }
  };

  const blocked = deleteTarget && (deleteTarget.childrenCount > 0 || deleteTarget.productsCount > 0);

  return (
    <>
      <PageHeader
        title="دسته‌بندی‌ها"
        description={list ? `${formatNumber(items.length)} دسته‌بندی • ${formatNumber(activeCount)} فعال` : undefined}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={categories.reload}>
              بروزرسانی
            </Button>
            <Button size="sm" icon={Plus} disabled={!list} onClick={() => openCreate()}>
              افزودن دسته‌بندی
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو: نام یا آدرس دسته‌بندی"
            aria-label="جستجوی دسته‌بندی"
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-blue"
          />
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/40">
          ترتیب این لیست همان ترتیب نمایش در منو و صفحه اصلی فروشگاه است؛ اولین دسته‌بندی اصلی در صفحه اصلی بزرگ‌تر
          نمایش داده می‌شود. حداکثر {formatNumber(MAX_CATEGORY_DEPTH)} سطح دسته‌بندی مجاز است.
        </p>
      </Card>

      {categories.error && list && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{categories.error}</span>
          <Button variant="secondary" size="sm" onClick={categories.reload}>
            تلاش دوباره
          </Button>
        </div>
      )}

      <Card padding="p-0">
        {categories.error && !list ? (
          <ErrorState message={categories.error} onRetry={categories.reload} />
        ) : !list ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="هنوز دسته‌بندی‌ای ساخته نشده است"
            description="برای نمایش محصولات در منو و فروشگاه، اول چند دسته‌بندی بسازید."
            action={
              <Button icon={Plus} onClick={() => openCreate()}>
                افزودن دسته‌بندی
              </Button>
            }
          />
        ) : visibleRows.length === 0 ? (
          <EmptyState title="دسته‌بندی‌ای با این جستجو پیدا نشد" description="عبارت جستجو را تغییر دهید." />
        ) : (
          <ul className={categories.loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {visibleRows.map((category) => (
              <CategoryRow
                key={category._id}
                category={category}
                active={isActive(category)}
                toggling={category._id in overrides}
                position={positions.get(String(category._id))}
                showMove={!searching}
                moving={movingId !== null}
                canAddChild={category.depth + 1 < MAX_CATEGORY_DEPTH}
                onToggle={toggleActive}
                onMove={move}
                onAddChild={(c) => openCreate(String(c._id))}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </ul>
        )}
      </Card>

      {modal && (
        <CategoryModal
          key={modal.key}
          open={modal.open}
          category={modal.category}
          parentId={modal.parentId}
          list={items}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget) && !blocked}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        title="حذف دسته‌بندی"
        message={`«${deleteTarget?.name || ""}» برای همیشه حذف می‌شود و این کار قابل بازگشت نیست.`}
        confirmLabel="حذف دسته‌بندی"
        onConfirm={confirmDelete}
      />

      <Modal
        open={Boolean(deleteTarget) && Boolean(blocked)}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        title="حذف ممکن نیست"
        footer={<Button onClick={() => setDeleteTarget(null)}>متوجه شدم</Button>}
      >
        <p className="mb-3 text-sm leading-7 text-ink/70">
          «{deleteTarget?.name}» را نمی‌توان حذف کرد، چون هنوز:
        </p>
        <ul className="mb-4 list-disc space-y-1.5 pr-5 text-sm leading-7 text-ink/80">
          {deleteTarget?.childrenCount > 0 && (
            <li>{formatNumber(deleteTarget.childrenCount)} زیردسته دارد؛ آن‌ها را حذف یا به دسته‌بندی دیگری منتقل کنید.</li>
          )}
          {deleteTarget?.productsCount > 0 && (
            <li>{formatNumber(deleteTarget.productsCount)} محصول در آن قرار دارد؛ آن‌ها را به دسته‌بندی دیگری منتقل کنید.</li>
          )}
        </ul>
        {deleteTarget?.productsCount > 0 && (
          <Link
            to={`/products?category=${deleteTarget._id}`}
            className="text-sm font-bold text-blue hover:underline"
          >
            مشاهده محصولات این دسته‌بندی
          </Link>
        )}
      </Modal>
    </>
  );
}

export default CategoriesPage;