import { useMemo, useState } from "react";
import { Banknote, CalendarDays, RefreshCw, ShoppingBag, Shirt, TrendingUp, Truck, Users, Wallet } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import StatCard from "../../components/ui/StatCard";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import AttentionStrip from "../../components/dashboard/AttentionStrip";
import SalesChartCard from "../../components/dashboard/SalesChartCard";
import OrderStatusCard from "../../components/dashboard/OrderStatusCard";
import TopProductsCard from "../../components/dashboard/TopProductsCard";
import RecentOrdersCard from "../../components/dashboard/RecentOrdersCard";
import LowStockCard from "../../components/dashboard/LowStockCard";
import { useAsync } from "../../hooks/useAsync";
import { getOverview, getSalesChart } from "../../services/dashboardApi";
import { formatJalaliDate, formatNumber } from "../../utils/format";

const RANGE_OPTIONS = [
  { value: 7, label: "۷ روز" },
  { value: 30, label: "۳۰ روز" },
  { value: 90, label: "۹۰ روز" },
];

const monthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "Asia/Tehran", month: "long" });

function DashboardPage() {
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  const overview = useAsync(() => getOverview(), [refreshKey]);
  const sales = useAsync(() => getSalesChart(days), [days, refreshKey]);

  const monthName = useMemo(() => monthFormatter.format(new Date()), []);
  const o = overview.data;
  const initialLoading = overview.loading && !o;

  const stat = (props) => <StatCard loading={initialLoading} {...props} />;

  return (
    <>
      <PageHeader
        title="داشبورد"
        description={`امروز ${formatJalaliDate(new Date())}`}
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
            بروزرسانی
          </Button>
        }
      />

      {overview.error && !o ? (
        <Card className="mb-6">
          <ErrorState message={overview.error} onRetry={overview.reload} />
        </Card>
      ) : (
        <>
          <AttentionStrip overview={o} />

          <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {stat({
              label: "درآمد امروز",
              icon: Wallet,
              value: formatNumber(o?.revenue.today),
              unit: "تومان",
              hint: `${formatNumber(o?.orders.today)} سفارش`,
              iconClassName: "bg-blue/10 text-blue",
            })}
            {stat({
              label: `درآمد ${monthName}`,
              icon: CalendarDays,
              value: formatNumber(o?.revenue.thisMonth),
              unit: "تومان",
              hint: `${formatNumber(o?.orders.thisMonth)} سفارش`,
              iconClassName: "bg-blue/10 text-blue",
            })}
            {stat({
              label: "درآمد ۳۰ روز اخیر",
              icon: TrendingUp,
              value: formatNumber(o?.revenue.last30Days),
              unit: "تومان",
              change: o?.revenue.change,
            })}
            {stat({
              label: "سفارش ۳۰ روز اخیر",
              icon: ShoppingBag,
              value: formatNumber(o?.orders.last30Days),
              change: o?.orders.change,
            })}
            {stat({
              label: "کل درآمد",
              icon: Banknote,
              value: formatNumber(o?.revenue.total),
              unit: "تومان",
              hint: `${formatNumber(o?.orders.total)} سفارش`,
            })}
            {stat({
              label: "مشتریان",
              icon: Users,
              value: formatNumber(o?.customers.total),
              hint: `${formatNumber(o?.customers.newThisMonth)} جدید در ${monthName}`,
            })}
            {stat({
              label: "محصولات فعال",
              icon: Shirt,
              value: `${formatNumber(o?.products.active)} از ${formatNumber(o?.products.total)}`,
            })}
            {stat({
              label: "در انتظار ارسال",
              icon: Truck,
              value: formatNumber(o?.orders.processing),
              hint: `${formatNumber(o?.orders.unpaid)} در انتظار پرداخت`,
            })}
          </div>
        </>
      )}

      <div className="space-y-6">
        <SalesChartCard
          key={days}
          state={sales}
          actions={<SegmentedControl size="sm" ariaLabel="بازه زمانی" options={RANGE_OPTIONS} value={days} onChange={setDays} />}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <OrderStatusCard days={30} refreshKey={refreshKey} />
          <TopProductsCard days={30} refreshKey={refreshKey} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <RecentOrdersCard refreshKey={refreshKey} />
          <LowStockCard refreshKey={refreshKey} />
        </div>
      </div>
    </>
  );
}

export default DashboardPage;