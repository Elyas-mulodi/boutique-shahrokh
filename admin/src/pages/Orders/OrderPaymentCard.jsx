import Card from "../../components/ui/Card";
import InfoRow from "../../components/ui/InfoRow";
import { PaymentBadge } from "./OrderBadges";
import { formatJalaliDateTime } from "../../utils/format";

function stockLabel(order) {
  if (order.paymentStatus !== "paid") return "—";
  if (order.stockRestored) return "به انبار برگشت داده شد";
  if (order.stockDeductionFailed) return "مشکل دارد (نیازمند بررسی)";
  if (order.stockDeducted) return "کسر شد";
  return "کسر نشده";
}

function OrderPaymentCard({ order }) {
  return (
    <Card>
      <h3 className="mb-2 font-heading font-bold text-ink">پرداخت و ارسال</h3>
      <dl className="divide-y divide-ink/5">
        <InfoRow label="وضعیت پرداخت">
          <PaymentBadge status={order.paymentStatus} />
        </InfoRow>
        {order.paidAt && <InfoRow label="زمان پرداخت">{formatJalaliDateTime(order.paidAt)}</InfoRow>}
        {order.paymentRefId && (
          <InfoRow label="کد پیگیری بانک">
            <span dir="ltr">{order.paymentRefId}</span>
          </InfoRow>
        )}
        <InfoRow label="موجودی انبار">{stockLabel(order)}</InfoRow>
        <InfoRow label="کد رهگیری مرسوله">
          {order.trackingCode ? <span dir="ltr">{order.trackingCode}</span> : "ثبت نشده"}
        </InfoRow>
        {order.shippedAt && <InfoRow label="زمان ارسال">{formatJalaliDateTime(order.shippedAt)}</InfoRow>}
        {order.deliveredAt && <InfoRow label="زمان تحویل">{formatJalaliDateTime(order.deliveredAt)}</InfoRow>}
        {order.canceledAt && <InfoRow label="زمان لغو">{formatJalaliDateTime(order.canceledAt)}</InfoRow>}
      </dl>
    </Card>
  );
}

export default OrderPaymentCard;