import { useState } from "react";
import { RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import StatCard from "../../components/ui/StatCard";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import SalesChartCard from "../../components/dashboard/SalesChartCard";
import OrderStatusCard from "../../components/dashboard/OrderStatusCard";
import TopProductsCard from "../../components/dashboard/TopProductsCard";
import CategorySalesCard from "../../components/dashboard/CategorySalesCard";
import ProvinceSalesCard from "../../components/dashboard/ProvinceSalesCard";
import TopCustomersCard from "../../components/dashboard/TopCustomersCard";
import { useAsync } from "../../hooks/useAsync";
import { getSalesChart } from "../../services/dashboardApi";
import { formatNumber, percentChange, rangeLabel } from "../../utils/format";

const RANGE_OPTIONS = [
  { value: 7, label: "۷ روز" },
  { value: 30, label: "۳۰ روز" },
  { value: 90, label: "۹۰ روز" },
  { value: 365, label: "۱ سال" },
];

const averageOrder = (revenue, orders) => (orders ? Math.round(revenue / orders) : 0);

function ReportsPage() {
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  const sales = useAsync(() => getSalesChart(days), [days, refreshKey]);
  const d = sales.data;
  const initialLoading = sales.loading && !d;

  const previous = d?.previous;
  const aov = d ? averageOrder(d.totals.revenue, d.totals.orders) : 0;
  const previousAov = previous ? averageOrder(previous.revenue, previous.orders) : 0;
  const compare = `در مقایسه با ${formatNumber(days)} روز قبل`;

  return (
    <>
      <PageHeader
        title="آمار و گزارش‌ها"
        description={`همه آمار برای ${rangeLabel(days)}`}
        actions={
          <>
            <SegmentedControl size="sm" ariaLabel="بازه زمانی" options={RANGE_OPTIONS} value={days} onChange={setDays} />
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
              بروزرسانی
            </Button>
          </>
        }
      />

      {sales.error && !d ? (
        <Card className="mb-6">
          <ErrorState message={sales.error} onRetry={sales.reload} />
        </Card>
      ) : (
        <div
          className={`mb-6 grid grid-cols-2 gap-3 transition-opacity md:gap-4 xl:grid-cols-4 ${
            sales.loading && d ? "opacity-60" : ""
          }`}
        >
          <StatCard
            loading={initialLoading}
            label="درآمد"
            value={formatNumber(d?.totals.revenue)}
            unit="تومان"
            change={d ? percentChange(d.totals.revenue, previous?.revenue ?? 0) : undefined}
            hint={compare}
          />
          <StatCard
            loading={initialLoading}
            label="تعداد سفارش"
            value={formatNumber(d?.totals.orders)}
            change={d ? percentChange(d.totals.orders, previous?.orders ?? 0) : undefined}
            hint={compare}
          />
          <StatCard
            loading={initialLoading}
            label="میانگین ارزش سفارش"
            value={formatNumber(aov)}
            unit="تومان"
            change={d ? percentChange(aov, previousAov) : undefined}
            hint={compare}
          />
          <StatCard
            loading={initialLoading}
            label="کاربران جدید"
            value={formatNumber(d?.totals.newUsers)}
            change={d ? percentChange(d.totals.newUsers, previous?.newUsers ?? 0) : undefined}
            hint={compare}
          />
        </div>
      )}

      <div className="space-y-6">
        <SalesChartCard key={days} state={sales} />

        <div className="grid gap-6 xl:grid-cols-2">
          <OrderStatusCard days={days} refreshKey={refreshKey} />
          <CategorySalesCard days={days} refreshKey={refreshKey} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <TopProductsCard days={days} limit={10} refreshKey={refreshKey} />
          <ProvinceSalesCard days={days} refreshKey={refreshKey} />
        </div>

        <TopCustomersCard days={days} limit={10} refreshKey={refreshKey} />
      </div>
    </>
  );
}

export default ReportsPage;