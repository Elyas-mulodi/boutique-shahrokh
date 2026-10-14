import { useState } from "react";
import { Shirt } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import SegmentedControl from "../ui/SegmentedControl";
import RankedBarList from "../charts/RankedBarList";
import { useAsync } from "../../hooks/useAsync";
import { getTopProducts } from "../../services/dashboardApi";
import { formatNumber, formatToman, rangeLabel } from "../../utils/format";

const OPTIONS = [
  { value: "sold", label: "تعداد" },
  { value: "revenue", label: "درآمد" },
];

function TopProductsCard({ days, limit = 6, refreshKey = 0 }) {
  const [metric, setMetric] = useState("sold");
  const state = useAsync(
    () => getTopProducts({ days, limit, sort: metric }),
    [days, limit, metric, refreshKey]
  );

  return (
    <AsyncCard
      title="پرفروش‌ترین محصولات"
      subtitle={rangeLabel(days)}
      state={state}
      actions={<SegmentedControl size="sm" ariaLabel="شاخص" options={OPTIONS} value={metric} onChange={setMetric} />}
      isEmpty={(d) => d.length === 0}
      emptyIcon={Shirt}
      emptyTitle="هنوز فروشی ثبت نشده است"
    >
      {(data) => (
        <RankedBarList
          items={data.map((p) => ({
            id: String(p.productId),
            title: p.name,
            subtitle: metric === "sold" ? formatToman(p.revenue) : `${formatNumber(p.totalSold)} عدد فروش`,
            value: metric === "sold" ? p.totalSold : p.revenue,
            valueLabel: metric === "sold" ? `${formatNumber(p.totalSold)} عدد` : formatToman(p.revenue),
            image: p.image || null,
          }))}
        />
      )}
    </AsyncCard>
  );
}

export default TopProductsCard;