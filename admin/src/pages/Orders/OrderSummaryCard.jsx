import Card from "../../components/ui/Card";
import { formatToman } from "../../utils/format";

const ZONES = { mashhad: "مشهد", other: "سایر شهرها" };

function Row({ label, children, tone = "text-ink" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-ink/50">{label}</span>
      <span className={`font-bold ${tone}`}>{children}</span>
    </div>
  );
}

function OrderSummaryCard({ order }) {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmount || 0;
  const shipping = order.shippingCost || 0;
  // اختلاف احتمالی سفارش‌های خیلی قدیمی؛ مبلغ نهایی همیشه مقدار ثبت‌شده است
  const other = order.totalAmount - (itemsTotal - discount + shipping);
  const zone = ZONES[order.shippingZone];

  return (
    <Card>
      <h3 className="mb-3 font-heading font-bold text-ink">خلاصه مبالغ</h3>

      <Row label="جمع کالاها">{formatToman(itemsTotal)}</Row>
      {discount > 0 && (
        <Row label={`تخفیف${order.couponCode ? ` (${order.couponCode})` : ""}`} tone="text-blue">
          - {formatToman(discount)}
        </Row>
      )}
      {shipping > 0 && <Row label={`هزینه ارسال${zone ? ` (${zone})` : ""}`}>{formatToman(shipping)}</Row>}
      {other !== 0 && <Row label="سایر">{formatToman(other)}</Row>}

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <span className="font-bold text-ink">مبلغ نهایی</span>
        <span className="font-heading text-lg font-bold text-ink">{formatToman(order.totalAmount)}</span>
      </div>
    </Card>
  );
}

export default OrderSummaryCard;