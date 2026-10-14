import { LayoutGrid } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import RankedBarList from "../charts/RankedBarList";
import { useAsync } from "../../hooks/useAsync";
import { getSalesByCategory } from "../../services/dashboardApi";
import { formatNumber, formatToman, rangeLabel } from "../../utils/format";

function CategorySalesCard({ days, refreshKey = 0 }) {
  const state = useAsync(() => getSalesByCategory(days), [days, refreshKey]);

  return (
    <AsyncCard
      title="فروش به تفکیک دسته‌بندی"
      subtitle={`${rangeLabel(days)} • فروش زیردسته‌ها در دسته اصلی حساب شده`}
      state={state}
      isEmpty={(d) => d.length === 0}
      emptyIcon={LayoutGrid}
      emptyTitle="هنوز فروشی ثبت نشده است"
    >
      {(data) => (
        <RankedBarList
          items={data.map((c) => ({
            id: String(c.categoryId),
            title: c.name,
            subtitle: `${formatNumber(c.sold)} عدد فروش`,
            value: c.revenue,
            valueLabel: formatToman(c.revenue),
          }))}
        />
      )}
    </AsyncCard>
  );
}

export default CategorySalesCard;