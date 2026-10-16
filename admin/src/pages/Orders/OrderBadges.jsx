import Badge from "../../components/ui/Badge";
import { ORDER_STATUS } from "../../constants/orderStatus";
import { getOrderState } from "../../utils/orderState";

const PAYMENT = {
  paid: { label: "پرداخت‌شده", tone: "success" },
  pending: { label: "در انتظار پرداخت", tone: "neutral" },
  failed: { label: "ناموفق/منقضی", tone: "danger" },
};

export function OrderStatusBadge({ order }) {
  const meta = ORDER_STATUS[getOrderState(order)] || ORDER_STATUS.inconsistent;
  return <Badge tone={meta.tone}>{meta.short}</Badge>;
}

export function PaymentBadge({ status }) {
  const meta = PAYMENT[status] || PAYMENT.pending;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}