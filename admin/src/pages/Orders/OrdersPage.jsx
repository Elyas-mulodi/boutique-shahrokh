import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import Thumb from "../../components/ui/Thumb";
import OrderFilters from "./OrderFilters";
import { OrderStatusBadge, PaymentBadge } from "./OrderBadges";
import { useAsync } from "../../hooks/useAsync";
import { listOrders } from "../../services/orderApi";
import { rangeToFrom } from "../../utils/dates";
import { needsAttention, orderCode } from "../../utils/orderState";
import { formatJalaliDateTime, formatNumber, formatToman } from "../../utils/format";

const PAGE_SIZE = 20;
const PAYMENT_VALUES = ["paid", "unpaid", "all"];
const STATUS_VALUES = ["pending_payment", "processing", "shipped", "delivered", "canceled"];
const RANGE_VALUES = ["today", "7", "30", "90"];

const totalQuantity = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

function AttentionIcon() {
  return (
    <span title="مشکل موجودی؛ نیازمند بررسی" className="inline-flex text-orange-600">
      <AlertTriangle size={16} />
    </span>
  );
}

function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const rawPage = Number.parseInt(searchParams.get("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawPayment = searchParams.get("paymentStatus");
  const paymentStatus = PAYMENT_VALUES.includes(rawPayment) ? rawPayment : "paid";
  const rawStatus = searchParams.get("status");
  const status = STATUS_VALUES.includes(rawStatus) ? rawStatus : "";
  const rawRange = searchParams.get("range");
  const range = RANGE_VALUES.includes(rawRange) ? rawRange : "";
  const attention = searchParams.get("attention") === "1";
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

  const handleChange = (patch) => {
    const next = { ...patch };
    if ("paymentStatus" in next) {
      next.paymentStatus = next.paymentStatus === "paid" ? "" : next.paymentStatus;
      next.status = "";
    }
    if ("attention" in next) next.attention = next.attention ? "1" : "";
    update(next);
  };

  const query = searchParams.toString();
  const orders = useAsync(
    () =>
      listOrders({
        page,
        limit: PAGE_SIZE,
        status,
        paymentStatus,
        search: urlSearch,
        attention: attention ? "1" : "",
        from: rangeToFrom(range)?.toISOString() || "",
      }),
    [query, refreshKey]
  );
  const data = orders.data;

  // اگه صفحه از تعداد صفحات بیشتر شد (بعد از فیلتر)، به آخرین صفحه برگرد
  useEffect(() => {
    if (data && data.pages && page > data.pages) {
      update({ page: data.pages > 1 ? data.pages : "" }, { replace: true });
    }
  }, [data, page, update]);

  const hasFilters = Boolean(urlSearch || range || status || attention || paymentStatus !== "paid");
  const clearFilters = () => setSearchParams({});

  const columns = [
    {
      key: "code",
      header: "سفارش",
      render: (o) => (
        <div className="flex items-center gap-3">
          <Thumb key={o.items[0]?.image || "none"} src={o.items[0]?.image} alt="" className="h-12 w-10" />
          <div>
            <p className="font-bold" dir="ltr">
              #{orderCode(o._id)}
            </p>
            <p className="text-xs text-ink/40">{formatNumber(totalQuantity(o))} عدد</p>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "مشتری",
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate font-bold">{o.user?.name || "کاربر حذف‌شده"}</p>
          <p className="text-xs text-ink/40" dir="ltr">
            {o.user?.phone || "—"}
          </p>
        </div>
      ),
    },
    { key: "date", header: "تاریخ ثبت", render: (o) => formatJalaliDateTime(o.createdAt) },
    { key: "city", header: "شهر", render: (o) => o.address?.city || "—" },
    { key: "total", header: "مبلغ", render: (o) => <span className="font-bold">{formatToman(o.totalAmount)}</span> },
    { key: "payment", header: "پرداخت", render: (o) => <PaymentBadge status={o.paymentStatus} /> },
    {
      key: "status",
      header: "وضعیت",
      render: (o) => (
        <div className="flex items-center gap-2">
          <OrderStatusBadge order={o} />
          {needsAttention(o) && <AttentionIcon />}
        </div>
      ),
    },
    {
      key: "open",
      header: "",
      align: "end",
      render: () => <ChevronLeft size={18} className="text-ink/30" />,
    },
  ];

  const renderMobileCard = (o) => (
    <div className="flex gap-3 p-4">
      <Thumb key={o.items[0]?.image || "none"} src={o.items[0]?.image} alt="" className="h-16 w-12" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-ink" dir="ltr">
            #{orderCode(o._id)}
          </p>
          <span className="text-sm font-bold text-ink">{formatToman(o.totalAmount)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-ink/70">
          {o.user?.name || "کاربر حذف‌شده"} • {o.address?.city || "—"}
        </p>
        <p className="text-xs text-ink/40">{formatJalaliDateTime(o.createdAt)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <OrderStatusBadge order={o} />
          <PaymentBadge status={o.paymentStatus} />
          {needsAttention(o) && <AttentionIcon />}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="سفارش‌ها"
        description={data ? `${formatNumber(data.total)} سفارش` : undefined}
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
            بروزرسانی
          </Button>
        }
      />

      <Card className="mb-4">
        <OrderFilters
          filters={{ search: urlSearch, paymentStatus, status, range, attention }}
          searchText={searchText}
          onSearchText={setSearchText}
          counts={data?.counts}
          attentionCount={data?.attentionCount}
          onChange={handleChange}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />
      </Card>

      <div className={orders.loading && data ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <DataTable
          columns={columns}
          rows={data?.orders || []}
          loading={orders.loading && !data}
          error={Boolean(orders.error)}
          errorMessage={orders.error}
          onRetry={orders.reload}
          emptyTitle={hasFilters ? "سفارشی با این فیلترها پیدا نشد" : "هنوز سفارشی ثبت نشده است"}
          emptyDescription={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید." : undefined}
          emptyAction={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                پاک‌کردن فیلترها
              </Button>
            ) : undefined
          }
          renderMobileCard={renderMobileCard}
          onRowClick={(o) => navigate(`/orders/${o._id}`)}
        />
      </div>

      {data && !orders.error && (
        <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => update({ page: p })} />
      )}
    </>
  );
}

export default OrdersPage;