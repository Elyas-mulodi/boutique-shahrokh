import { useCallback, useMemo, useState } from "react";
import { Images, Plus, RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import { deleteBanner, listAllBanners, updateBanner } from "../../services/bannerApi";
import { getErrorMessage } from "../../utils/error";
import { formatNumber } from "../../utils/format";
import { PLACEMENT_LABELS, getBannerStatus } from "../../utils/banners";
import BannerRow from "./BannerRow";
import BannerModal from "./BannerModal";

const FILTERS = [{ value: "all", label: "همه" }, ...Object.entries(PLACEMENT_LABELS).map(([value, label]) => ({ value, label }))];

function ListSkeleton() {
  return (
    <div className="divide-y divide-ink/5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-16 w-28 rounded-lg" />
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

function BannersPage() {
  const toast = useToast();
  const banners = useAsync(() => listAllBanners(), []);

  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { key, open, banner }
  const [overrides, setOverrides] = useState({});
  const [movingId, setMovingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const list = banners.data;
  const items = useMemo(() => list || [], [list]);
  const visible = useMemo(() => (filter === "all" ? items : items.filter((b) => b.placement === filter)), [items, filter]);

  const isActive = useCallback((b) => (b._id in overrides ? overrides[b._id] : b.isActive), [overrides]);
  const liveCount = items.filter((b) => getBannerStatus({ ...b, isActive: isActive(b) }).live).length;

  // جایگاه هر بنر بین بنرهای هم‌جایگاهش (برای فعال/غیرفعال بودن فلش‌ها)
  const positions = useMemo(() => {
    const map = new Map();
    const groups = {};
    items.forEach((b) => (groups[b.placement] = [...(groups[b.placement] || []), b]));
    Object.values(groups).forEach((group) => {
      group.forEach((b, index) => map.set(String(b._id), { index, count: group.length }));
    });
    return map;
  }, [items]);

  const openCreate = () => setModal({ key: Date.now(), open: true, banner: null });
  const openEdit = (banner) => setModal({ key: Date.now(), open: true, banner });
  const closeModal = () => setModal((m) => (m ? { ...m, open: false } : m));
  const handleSaved = () => {
    closeModal();
    banners.reload();
  };

  const toggleActive = async (banner) => {
    const next = !isActive(banner);
    setOverrides((o) => ({ ...o, [banner._id]: next }));

    try {
      await updateBanner(banner._id, { isActive: next });
      toast.success(next ? "بنر فعال شد" : "بنر از سایت برداشته شد");
      await banners.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت بنر"));
    } finally {
      setOverrides((o) => {
        const copy = { ...o };
        delete copy[banner._id];
        return copy;
      });
    }
  };

  // ترتیب بین بنرهای هم‌جایگاه عوض میشه و فقط order های تغییرکرده ذخیره میشن
  const move = async (banner, direction) => {
    const group = items.filter((b) => b.placement === banner.placement);
    const index = group.findIndex((b) => b._id === banner._id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= group.length) return;

    const next = [...group];
    [next[index], next[target]] = [next[target], next[index]];

    setMovingId(banner._id);
    try {
      await Promise.all(
        next.map((b, i) => (b.order === i ? null : updateBanner(b._id, { order: i }))).filter(Boolean)
      );
      await banners.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر ترتیب"));
    } finally {
      setMovingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteBanner(deleteTarget._id);
      toast.success(res?.message || "بنر حذف شد");
      setDeleteTarget(null);
      await banners.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در حذف بنر"));
      setDeleteTarget(null);
      await banners.reload();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="بنرها"
        description={list ? `${formatNumber(items.length)} بنر • ${formatNumber(liveCount)} در حال نمایش` : undefined}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={banners.reload}>
              بروزرسانی
            </Button>
            <Button size="sm" icon={Plus} disabled={!list} onClick={openCreate}>
              افزودن بنر
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="فیلتر جایگاه بنر">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === f.value ? "bg-blue font-bold text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/40">
          ترتیب این لیست همان ترتیب نمایش در سایت است. بنر غیرفعال، زمان‌بندی‌شده یا منقضی‌شده در سایت دیده نمی‌شود.
        </p>
      </Card>

      {banners.error && list && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{banners.error}</span>
          <Button variant="secondary" size="sm" onClick={banners.reload}>
            تلاش دوباره
          </Button>
        </div>
      )}

      <Card padding="p-0">
        {banners.error && !list ? (
          <ErrorState message={banners.error} onRetry={banners.reload} />
        ) : !list ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Images}
            title="هنوز بنری ساخته نشده است"
            description="با ساخت بنر، متن و تصویر صفحه اصلی سایت را بدون تغییر کد عوض کنید."
            action={
              <Button icon={Plus} onClick={openCreate}>
                افزودن بنر
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState title="بنری در این جایگاه نیست" description="جایگاه دیگری را انتخاب کنید یا بنر جدید بسازید." />
        ) : (
          <ul className={banners.loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {visible.map((banner) => (
              <BannerRow
                key={banner._id}
                banner={banner}
                active={isActive(banner)}
                toggling={banner._id in overrides}
                position={positions.get(String(banner._id))}
                moving={movingId !== null}
                onToggle={toggleActive}
                onMove={move}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </ul>
        )}
      </Card>

      {modal && (
        <BannerModal
          key={modal.key}
          open={modal.open}
          banner={modal.banner}
          nextOrder={items.length}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        title="حذف بنر"
        message={`«${deleteTarget?.title || ""}» برای همیشه حذف می‌شود و این کار قابل بازگشت نیست.`}
        confirmLabel="حذف بنر"
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default BannersPage;