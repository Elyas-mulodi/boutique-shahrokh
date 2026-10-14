import { MapPin } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import RankedBarList from "../charts/RankedBarList";
import { useAsync } from "../../hooks/useAsync";
import { getSalesByProvince } from "../../services/dashboardApi";
import { formatNumber, formatToman, rangeLabel } from "../../utils/format";

function ProvinceSalesCard({ days, refreshKey = 0 }) {
  const state = useAsync(() => getSalesByProvince(days), [days, refreshKey]);

  return (
    <AsyncCard
      title="فروش به تفکیک استان"
      subtitle={rangeLabel(days)}
      state={state}
      isEmpty={(d) => d.length === 0}
      emptyIcon={MapPin}
      emptyTitle="هنوز فروشی ثبت نشده است"
    >
      {(data) => (
        <RankedBarList
          color="#0891B2"
          items={data.map((p) => ({
            id: p.province || "unknown",
            title: p.province || "نامشخص",
            subtitle: `${formatNumber(p.orders)} سفارش`,
            value: p.revenue,
            valueLabel: formatToman(p.revenue),
          }))}
        />
      )}
    </AsyncCard>
  );
}

export default ProvinceSalesCard;