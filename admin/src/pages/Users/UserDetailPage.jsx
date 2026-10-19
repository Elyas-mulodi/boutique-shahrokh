import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Ban, ChevronLeft, PackageOpen, ShieldCheck } from "lucide-react";
import BackLink from "../../components/ui/BackLink";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Skeleton from "../../components/ui/Skeleton";
import StatCard from "../../components/ui/StatCard";
import InfoRow from "../../components/ui/InfoRow";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Thumb from "../../components/ui/Thumb";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import { getUserDetail, setUserBlocked } from "../../services/userApi";
import { getErrorMessage } from "../../utils/error";
import { orderCode } from "../../utils/orderState";
import { formatJalaliDate, formatJalaliDateTime, formatNumber, formatToman } from "../../utils/format";
import { OrderStatusBadge } from "../Orders/OrderBadges";
import { AccountStatusBadge, RoleBadge } from "./UserBadges";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function UserDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const me = useSelector((state) => state.auth.user);
  const state = useAsync(() => getUserDetail(id), [id]);
  const data = state.data && String(state.data.user._id) === id ? state.data : null;

  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!data && state.error) {
    const notFound = state.errorStatus === 404 || state.errorStatus === 400;
    return (
      <>
        <BackLink to="/users">بازگشت به کاربران</BackLink>
        <Card>
          {notFound ? (
            <div className="py-10 text-center">
              <p className="font-heading font-bold text-ink">کاربر پیدا نشد</p>
              <p className="mt-1 text-sm text-ink/50">ممکن است این کاربر حذف شده باشد.</p>
            </div>
          ) : (
            <ErrorState message={state.error} onRetry={state.reload} />
          )}
        </Card>
      </>
    );
  }

  if (!data) return <DetailSkeleton />;

  const { user, stats, orders } = data;
  const isMe = me && String(me._id) === String(user._id);
  const canBlock = user.role !== "admin";

  const handleBlock = async () => {
    setBusy(true);
    try {
      const res = await setUserBlocked(user._id, !user.isBlocked);
      toast.success(res?.message || "انجام شد");
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت کاربر"));
    } finally {
      setConfirm(false);
      setBusy(false);
      state.reload();
    }
  };

  const address = user.defaultAddress;

  return (
    <>
      <BackLink to="/users">بازگشت به کاربران</BackLink>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={user.name} size="lg" muted={user.isBlocked} />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-bold text-ink md:text-2xl">{user.name}</h1>
            <p className="mt-0.5 text-sm text-ink/50" dir="ltr" style={{ textAlign: "right" }}>
              {user.phone}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <AccountStatusBadge blocked={user.isBlocked} />
            </div>
          </div>
        </div>

        {canBlock && (
          <Button
            variant={user.isBlocked ? "secondary" : "danger"}
            icon={user.isBlocked ? ShieldCheck : Ban}
            onClick={() => setConfirm(true)}
          >
            {user.isBlocked ? "آزادکردن کاربر" : "مسدودکردن کاربر"}
          </Button>
        )}
      </div>

      {user.isBlocked && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          این حساب مسدود است؛ کاربر نمی‌تواند وارد شود یا سفارش ثبت کند.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="مجموع خرید" value={formatNumber(stats.totalSpent)} unit="تومان" />
        <StatCard label="تعداد سفارش" value={formatNumber(stats.ordersCount)} />
        <StatCard label="میانگین ارزش سفارش" value={formatNumber(stats.averageOrder)} unit="تومان" />
        <StatCard
          label="آخرین خرید"
          value={stats.lastOrderAt ? formatJalaliDate(stats.lastOrderAt) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
              <div>
                <h3 className="font-heading font-bold text-ink">سفارش‌های پرداخت‌شده</h3>
                <p className="mt-0.5 text-xs text-ink/50">
                  {stats.paidCount > orders.length
                    ? `${formatNumber(orders.length)} سفارش آخر از ${formatNumber(stats.paidCount)}`
                    : `${formatNumber(stats.paidCount)} سفارش`}
                </p>
              </div>
              {stats.paidCount > 0 && (
                <Link
                  to={`/orders?search=${encodeURIComponent(user.phone)}`}
                  className="text-xs font-bold text-blue hover:underline"
                >
                  مشاهده همه
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <EmptyState icon={PackageOpen} title="این کاربر هنوز سفارش پرداخت‌شده‌ای ندارد" />
            ) : (
              <ul className="divide-y divide-ink/5">
                {orders.map((order) => (
                  <li key={order._id}>
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink/[0.02]"
                    >
                      <Thumb key={order.items?.[0]?.image || "none"} src={order.items?.[0]?.image} alt="" className="h-12 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink" dir="ltr" style={{ textAlign: "right" }}>
                          #{orderCode(order._id)}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-ink/40">
                          {order.address?.city || "—"} • {formatJalaliDateTime(order.paidAt || order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                        <span className="text-sm font-bold text-ink">{formatToman(order.totalAmount)}</span>
                        <OrderStatusBadge order={order} />
                      </div>
                      <ChevronLeft size={16} className="flex-shrink-0 text-ink/30" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="mt-3 text-xs leading-6 text-ink/40">
            سفارش‌های لغوشده و پرداخت‌نشده در آمار خرید حساب نمی‌شوند.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-2 font-heading font-bold text-ink">اطلاعات حساب</h3>
            <dl className="divide-y divide-ink/5">
              <InfoRow label="نام">
                {user.name}
                {isMe && <span className="mr-2 text-xs font-normal text-blue">(شما)</span>}
              </InfoRow>
              <InfoRow label="موبایل">
                <a href={`tel:${user.phone}`} dir="ltr" className="text-blue hover:underline">
                  {user.phone}
                </a>
              </InfoRow>
              <InfoRow label="نقش">
                <RoleBadge role={user.role} />
              </InfoRow>
              <InfoRow label="وضعیت حساب">
                <AccountStatusBadge blocked={user.isBlocked} />
              </InfoRow>
              <InfoRow label="تاریخ عضویت">{formatJalaliDateTime(user.createdAt)}</InfoRow>
              <InfoRow label="سفارش لغوشده">{formatNumber(stats.canceledCount)}</InfoRow>
            </dl>
          </Card>

          <Card>
            <h3 className="mb-2 font-heading font-bold text-ink">آدرس ذخیره‌شده</h3>
            {address ? (
              <>
                <dl className="divide-y divide-ink/5">
                  <InfoRow label="گیرنده">{address.receiverName}</InfoRow>
                  <InfoRow label="موبایل گیرنده">
                    <span dir="ltr">{address.receiverPhone}</span>
                  </InfoRow>
                  <InfoRow label="استان / شهر">
                    {address.province}، {address.city}
                  </InfoRow>
                  <InfoRow label="کد پستی">
                    <span dir="ltr">{address.postalCode}</span>
                  </InfoRow>
                </dl>
                <p className="mt-3 rounded-xl bg-ink/[0.03] p-3 text-sm leading-7 text-ink/80">{address.fullAddress}</p>
              </>
            ) : (
              <p className="py-2 text-sm text-ink/50">هنوز آدرسی ذخیره نشده است.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        loading={busy}
        tone={user.isBlocked ? "primary" : "danger"}
        title={user.isBlocked ? "آزادکردن کاربر" : "مسدودکردن کاربر"}
        message={
          user.isBlocked
            ? `حساب «${user.name}» دوباره فعال شود؟`
            : `حساب «${user.name}» مسدود شود؟ این کاربر فوراً از حساب خود خارج می‌شود و نمی‌تواند وارد شود یا سفارش ثبت کند. سفارش‌های قبلی‌اش تغییری نمی‌کند.`
        }
        confirmLabel={user.isBlocked ? "آزادکردن" : "مسدودکردن"}
        onConfirm={handleBlock}
      />
    </>
  );
}

export default UserDetailPage;