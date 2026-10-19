import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Ban, ChevronLeft, RefreshCw, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import { listUsers, setUserBlocked } from "../../services/userApi";
import { getErrorMessage } from "../../utils/error";
import { formatJalaliShortDate, formatNumber, formatToman } from "../../utils/format";
import UserFilters from "./UserFilters";
import { AccountStatusBadge, RoleBadge } from "./UserBadges";

const PAGE_SIZE = 20;
const ROLE_VALUES = ["customer", "admin"];
const BLOCKED_VALUES = ["true", "false"];
const SORT_VALUES = ["newest", "oldest", "name"];

function UsersPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const me = useSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const rawPage = Number.parseInt(searchParams.get("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawRole = searchParams.get("role");
  const role = ROLE_VALUES.includes(rawRole) ? rawRole : "";
  const rawBlocked = searchParams.get("blocked");
  const blocked = BLOCKED_VALUES.includes(rawBlocked) ? rawBlocked : "";
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

  const handleChange = (patch) =>
    update({ ...patch, ...("sort" in patch && patch.sort === "newest" ? { sort: "" } : {}) });

  const query = searchParams.toString();
  const users = useAsync(
    () => listUsers({ page, limit: PAGE_SIZE, search: urlSearch, role, blocked, sort }),
    [query, refreshKey]
  );
  const data = users.data;

  // اگه صفحه از تعداد صفحات بیشتر شد (بعد از فیلتر)، به آخرین صفحه برگرد
  useEffect(() => {
    if (data && data.pages && page > data.pages) {
      update({ page: data.pages > 1 ? data.pages : "" }, { replace: true });
    }
  }, [data, page, update]);

  const hasFilters = Boolean(urlSearch || role || blocked || sort !== "newest");
  const clearFilters = () => setSearchParams({});

  const confirmBlock = async () => {
    setBusy(true);
    try {
      const res = await setUserBlocked(target._id, !target.isBlocked);
      toast.success(res?.message || "انجام شد");
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت کاربر"));
    } finally {
      setTarget(null);
      setBusy(false);
      users.reload();
    }
  };

  const stop = (e) => e.stopPropagation();

  const blockButton = (user) => {
    if (user.role === "admin") return null;

    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setTarget(user);
        }}
        aria-label={user.isBlocked ? "آزادکردن" : "مسدودکردن"}
        title={user.isBlocked ? "آزادکردن" : "مسدودکردن"}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors ${
          user.isBlocked ? "hover:bg-green-50 hover:text-green-700" : "hover:bg-red-50 hover:text-red-600"
        }`}
      >
        {user.isBlocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
      </button>
    );
  };

  const isMe = (user) => me && String(me._id) === String(user._id);

  const columns = [
    {
      key: "user",
      header: "کاربر",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} muted={u.isBlocked} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="max-w-[220px] truncate font-bold">{u.name}</p>
              {isMe(u) && <Badge tone="blue">شما</Badge>}
            </div>
            <p className="text-xs text-ink/40" dir="ltr" style={{ textAlign: "right" }}>
              {u.phone}
            </p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "نقش", render: (u) => <RoleBadge role={u.role} /> },
    { key: "orders", header: "سفارش", render: (u) => formatNumber(u.ordersCount) },
    {
      key: "spent",
      header: "مجموع خرید",
      render: (u) => (u.totalSpent ? <span className="font-bold">{formatToman(u.totalSpent)}</span> : <span className="text-ink/30">—</span>),
    },
    { key: "last", header: "آخرین خرید", render: (u) => formatJalaliShortDate(u.lastOrderAt) },
    { key: "joined", header: "عضویت", render: (u) => formatJalaliShortDate(u.createdAt) },
    { key: "status", header: "وضعیت", render: (u) => <AccountStatusBadge blocked={u.isBlocked} /> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          {blockButton(u)}
          <ChevronLeft size={18} className="text-ink/30" />
        </div>
      ),
    },
  ];

  const renderMobileCard = (u) => (
    <div className="flex gap-3 p-4">
      <Avatar name={u.name} muted={u.isBlocked} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{u.name}</p>
            <p className="text-xs text-ink/40" dir="ltr" style={{ textAlign: "right" }}>
              {u.phone}
            </p>
          </div>
          {blockButton(u)}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <RoleBadge role={u.role} />
          <AccountStatusBadge blocked={u.isBlocked} />
          {isMe(u) && <Badge tone="blue">شما</Badge>}
        </div>

        <p className="mt-2 text-xs text-ink/50">
          {u.ordersCount ? `${formatNumber(u.ordersCount)} سفارش • ${formatToman(u.totalSpent)}` : "هنوز خریدی ندارد"}
        </p>
        <p className="text-xs text-ink/40">عضویت: {formatJalaliShortDate(u.createdAt)}</p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="کاربران"
        description={data ? `${formatNumber(data.total)} کاربر` : undefined}
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
            بروزرسانی
          </Button>
        }
      />

      <Card className="mb-4">
        <UserFilters
          filters={{ search: urlSearch, role, blocked, sort }}
          searchText={searchText}
          onSearchText={setSearchText}
          counts={data?.counts}
          onChange={handleChange}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />
      </Card>

      <div className={users.loading && data ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <DataTable
          columns={columns}
          rows={data?.users || []}
          loading={users.loading && !data}
          error={Boolean(users.error)}
          errorMessage={users.error}
          onRetry={users.reload}
          emptyTitle={hasFilters ? "کاربری با این فیلترها پیدا نشد" : "هنوز کاربری ثبت‌نام نکرده است"}
          emptyDescription={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید." : undefined}
          emptyAction={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                پاک‌کردن فیلترها
              </Button>
            ) : undefined
          }
          renderMobileCard={renderMobileCard}
          onRowClick={(u) => navigate(`/users/${u._id}`)}
        />
      </div>

      {data && !users.error && (
        <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => update({ page: p })} />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        loading={busy}
        tone={target?.isBlocked ? "primary" : "danger"}
        title={target?.isBlocked ? "آزادکردن کاربر" : "مسدودکردن کاربر"}
        message={
          target?.isBlocked
            ? `حساب «${target?.name}» دوباره فعال شود؟`
            : `حساب «${target?.name}» مسدود شود؟ این کاربر فوراً از حساب خود خارج می‌شود و نمی‌تواند وارد شود یا سفارش ثبت کند. سفارش‌های قبلی‌اش تغییری نمی‌کند.`
        }
        confirmLabel={target?.isBlocked ? "آزادکردن" : "مسدودکردن"}
        onConfirm={confirmBlock}
      />
    </>
  );
}

export default UsersPage;