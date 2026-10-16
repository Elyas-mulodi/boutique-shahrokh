import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Thumb from "../../components/ui/Thumb";
import { formatNumber, formatToman } from "../../utils/format";

function OrderItemsCard({ order }) {
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card padding="p-0">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <h3 className="font-heading font-bold text-ink">اقلام سفارش</h3>
        <span className="text-xs text-ink/50">{formatNumber(quantity)} عدد</span>
      </div>

      <ul className="divide-y divide-ink/5">
        {order.items.map((item, index) => {
          // سفارشی که پردازش شده ولی کسر موجودی این قلم انجام نشده
          const stockFailed = order.stockDeducted && item.stockDeducted === false;

          return (
            <li key={`${item.variantId}-${index}`} className="flex items-center gap-3 px-5 py-4">
              <Thumb key={item.image || "none"} src={item.image} alt={item.name} className="h-16 w-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  سایز {item.size} • رنگ {item.color}
                </p>
                <p className="mt-1 text-xs text-ink/40">
                  {formatNumber(item.quantity)} × {formatToman(item.price)}
                </p>
                {stockFailed && (
                  <Badge tone="danger" className="mt-1.5">
                    موجودی کافی نبود
                  </Badge>
                )}
              </div>
              <span className="flex-shrink-0 text-sm font-bold text-ink">
                {formatToman(item.price * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default OrderItemsCard;