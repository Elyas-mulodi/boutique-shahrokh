import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Plus, RefreshCw, Ticket, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Switch from "../../components/ui/Switch";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import {
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from "../../services/couponApi";
import { getErrorMessage } from "../../utils/error";
import { formatNumber } from "../../utils/format";
import CouponFilters from "./CouponFilters";
import CouponModal from "./CouponModal";
import {
  CodeChip,
  CouponStatusBadge,
  DiscountText,
  ExpiryCell,
  MinOrderText,
  UsageCell,
} from "./CouponParts";
import { getCouponStatus } from "./couponForm";

const PAGE_SIZE = 20;
const STATUS_VALUES = ["active", "inactive", "expired", "exhausted"];
const SORT_VALUES = ["newest", "expiry", "usage"];

const iconAction =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink";

function CouponsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [overrides, setOverrides] = useState({});
  const [modal, setModal] = useState(null); // { key, open, coupon }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rawPage = Number.parseInt(searchParams.get("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawStatus = searchParams.get("status");
  const status = STATUS_VALUES.includes(rawStatus) ? rawStatus : "";
  const rawSort = searchParams.get("sort");
  const sort = SORT_VALUES.includes(rawSort) ? rawSort : "newest";
  const urlSearch = searchParams.get("search") || "";

  const update = useCallback(
    (patch, options) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined)
            next.delete(key);
          else next.set(key, String(value));
        });
        if (!("page" in patch)) next.delete("page"); // تغییر فیلتر = برگشت به صفحه ۱
        return next;
      }, options);
    },
    [setSearchParams],
  );

  // جستجو با تاخیر ۴۰۰ میلی‌ثانیه
  const [searchText, setSearchText] = useState(urlSearch);

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const normalized = searchText.trim() ? searchText : "";
    if (normalized === urlSearch) return undefined;
    const timer = setTimeout(
      () => update({ search: normalized }, { replace: true }),
      400,
    );
    return () => clearTimeout(timer);
  }, [searchText, urlSearch, update]);

  const handleChange = (patch) =>
    update({
      ...patch,
      ...("sort" in patch && patch.sort === "newest" ? { sort: "" } : {}),
    });

  const query = searchParams.toString();
  const coupons = useAsync(
    () =>
      listCoupons({ page, limit: PAGE_SIZE, search: urlSearch, status, sort }),
    [query, refreshKey],
  );
  const data = coupons.data;

  // اگه صفحه از تعداد صفحات بیشتر شد (بعد از فیلتر یا حذف)، به آخرین صفحه برگرد
  useEffect(() => {
    if (data && data.pages && page > data.pages) {
      update({ page: data.pages > 1 ? data.pages : "" }, { replace: true });
    }
  }, [data, page, update]);

  const hasFilters = Boolean(urlSearch || status || sort !== "newest");
  const clearFilters = () => setSearchParams({});

  const isActive = (c) =>
    c._id in overrides ? overrides[c._id] : c.isActive !== false;
  const statusOf = (c) => getCouponStatus({ ...c, isActive: isActive(c) });

  const openCreate = () =>
    setModal({ key: Date.now(), open: true, coupon: null });
  const openEdit = (coupon) =>
    setModal({ key: Date.now(), open: true, coupon });
  const closeModal = () => setModal((m) => (m ? { ...m, open: false } : m));
  const handleSaved = () => {
    closeModal();
    coupons.reload();
  };

  const toggleActive = async (coupon) => {
    const next = !isActive(coupon);
    setOverrides((o) => ({ ...o, [coupon._id]: next }));

    try {
      await updateCoupon(coupon._id, { isActive: next });
      toast.success(next ? "کد تخفیف فعال شد" : "کد تخفیف غیرفعال شد");
      await coupons.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت کد تخفیف"));
    } finally {
      setOverrides((o) => {
        const copy = { ...o };
        delete copy[coupon._id];
        return copy;
      });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteCoupon(deleteTarget._id);
      toast.success(res?.message || "کد تخفیف حذف شد");
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در حذف کد تخفیف"));
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
      coupons.reload();
    }
  };

  const stop = (e) => e.stopPropagation();

  const actions = (coupon) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          openEdit(coupon);
        }}
        aria-label="ویرایش"
        title="ویرایش"
        className={iconAction}
      >
        <Pencil size={17} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setDeleteTarget(coupon);
        }}
        aria-label="حذف"
        title="حذف"
        className={`${iconAction} hover:bg-red-50 hover:text-red-600`}
      >
        <Trash2 size={17} />
      </button>
    </div>
  );

  const activeSwitch = (coupon) => (
    <Switch
      checked={isActive(coupon)}
      onChange={() => toggleActive(coupon)}
      loading={coupon._id in overrides}
      label={`فعال بودن ${coupon.code}`}
    />
  );

  const columns = [
    { key: "code", header: "کد", render: (c) => <CodeChip code={c.code} /> },
    {
      key: "discount",
      header: "تخفیف",
      render: (c) => <DiscountText coupon={c} />,
    },
    {
      key: "min",
      header: "حداقل سفارش",
      render: (c) => <MinOrderText coupon={c} />,
    },
    {
      key: "usage",
      header: "استفاده",
      render: (c) => <UsageCell coupon={c} />,
    },
    {
      key: "expiry",
      header: "انقضا",
      render: (c) => <ExpiryCell coupon={c} />,
    },
    {
      key: "status",
      header: "وضعیت",
      render: (c) => <CouponStatusBadge status={statusOf(c)} />,
    },
    { key: "active", header: "فعال", render: (c) => activeSwitch(c) },
    { key: "actions", header: "", align: "end", render: actions },
  ];

  const renderMobileCard = (c) => (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <CodeChip code={c.code} />
        <CouponStatusBadge status={statusOf(c)} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="mb-0.5 text-xs text-ink/40">تخفیف</p>
          <DiscountText coupon={c} />
        </div>
        <div>
          <p className="mb-0.5 text-xs text-ink/40">حداقل سفارش</p>
          <MinOrderText coupon={c} />
        </div>
        <div>
          <p className="mb-0.5 text-xs text-ink/40">استفاده</p>
          <UsageCell coupon={c} />
        </div>
        <div>
          <p className="mb-0.5 text-xs text-ink/40">انقضا</p>
          <ExpiryCell coupon={c} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeSwitch(c)}
          <span className="text-xs text-ink/50">
            {isActive(c) ? "فعال" : "غیرفعال"}
          </span>
        </div>
        {actions(c)}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="کدهای تخفیف"
        description={
          data ? `${formatNumber(data.counts.all)} کد تخفیف` : undefined
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              بروزرسانی
            </Button>
            <Button size="sm" icon={Plus} onClick={openCreate}>
              افزودن کد تخفیف
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CouponFilters
          filters={{ status, sort }}
          searchText={searchText}
          onSearchText={setSearchText}
          counts={data?.counts}
          onChange={handleChange}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />
      </Card>

      <div
        className={
          coupons.loading && data
            ? "opacity-60 transition-opacity"
            : "transition-opacity"
        }
      >
        <DataTable
          columns={columns}
          rows={data?.coupons || []}
          loading={coupons.loading && !data}
          error={Boolean(coupons.error)}
          errorMessage={coupons.error}
          onRetry={coupons.reload}
          emptyTitle={
            hasFilters
              ? "کد تخفیفی با این فیلترها پیدا نشد"
              : "هنوز کد تخفیفی ساخته نشده است"
          }
          emptyDescription={
            hasFilters
              ? "فیلترها را تغییر دهید یا پاک کنید."
              : "اولین کد تخفیف فروشگاه را بسازید."
          }
          emptyAction={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                پاک‌کردن فیلترها
              </Button>
            ) : (
              <Button size="sm" icon={Ticket} onClick={openCreate}>
                افزودن کد تخفیف
              </Button>
            )
          }
          renderMobileCard={renderMobileCard}
          onRowClick={openEdit}
        />
      </div>

      {data && !coupons.error && (
        <Pagination
          page={data.page}
          pages={data.pages}
          total={data.total}
          onChange={(p) => update({ page: p })}
        />
      )}

      <p className="mt-6 text-xs leading-6 text-ink/40">
        ظرفیت هر کد از لحظه‌ی ثبت سفارش رزرو می‌شود. اگر مشتری پرداخت را کامل
        نکند، تا ۲۴ ساعت بعد (یا با حذف سفارش توسط خود مشتری) آن ظرفیت آزاد
        می‌شود. «تعداد استفاده» شامل همین سفارش‌های در انتظار پرداخت هم هست، ولی
        آمار «سفارش پرداخت‌شده» و «مجموع تخفیف» در پنجره‌ی ویرایش فقط سفارش‌های
        واقعی را حساب می‌کند.
      </p>

      {modal && (
        <CouponModal
          key={modal.key}
          open={modal.open}
          coupon={modal.coupon}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        title="حذف کد تخفیف"
        message={`کد «${deleteTarget?.code || ""}» برای همیشه حذف می‌شود. اگر این کد تو سفارشی استفاده شده باشد، حذف انجام نمی‌شود و باید آن را غیرفعال کنید.`}
        confirmLabel="حذف کد تخفیف"
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default CouponsPage;
