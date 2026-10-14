import { Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import AsyncCard from "../ui/AsyncCard";
import Badge from "../ui/Badge";
import Thumb from "../ui/Thumb";
import { useAsync } from "../../hooks/useAsync";
import { getLowStock } from "../../services/dashboardApi";
import { formatNumber } from "../../utils/format";

const VISIBLE = 8;

function LowStockCard({ refreshKey = 0 }) {
  const state = useAsync(() => getLowStock(5), [refreshKey]);

  return (
    <AsyncCard
      title="موجودی کم یا تمام‌شده"
      subtitle="تنوع‌هایی (رنگ و سایز) که موجودی‌شان ۵ عدد یا کمتر است"
      state={state}
      actions={
        <Link to="/products" className="text-xs font-bold text-blue hover:underline">
          مدیریت محصولات
        </Link>
      }
      isEmpty={(d) => d.length === 0}
      emptyIcon={PackageCheck}
      emptyTitle="موجودی همه محصولات کافی است"
    >
      {(data) => (
        <>
          <ul className="divide-y divide-ink/5">
            {data.slice(0, VISIBLE).map((item, index) => (
              <li
                key={`${item.productId}-${item.size}-${item.color}-${index}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Thumb key={item.image || "none"} src={item.image} alt={item.name} className="h-11 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{item.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/50">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-ink/15"
                      style={{ backgroundColor: item.colorHex || "#D4D4D8" }}
                    />
                    {item.color} • سایز {item.size}
                  </p>
                </div>
                {item.stock === 0 ? (
                  <Badge tone="danger">تمام‌شده</Badge>
                ) : (
                  <Badge tone="warning">{formatNumber(item.stock)} عدد</Badge>
                )}
              </li>
            ))}
          </ul>
          {data.length > VISIBLE && (
            <p className="mt-3 text-center text-xs text-ink/40">
              و {formatNumber(data.length - VISIBLE)} مورد دیگر
            </p>
          )}
        </>
      )}
    </AsyncCard>
  );
}

export default LowStockCard;