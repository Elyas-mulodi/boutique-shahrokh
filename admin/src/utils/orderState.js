export const orderCode = (id) =>
  String(id || "")
    .slice(-6)
    .toUpperCase();

// وضعیت واقعی سفارش با در نظر گرفتن پرداخت
export function getOrderState(order) {
  const paid = order.paymentStatus === "paid";

  if (order.status === "canceled")
    return paid ? "canceled_paid" : "canceled_unpaid";
  if (order.status === "pending_payment")
    return paid ? "inconsistent" : "pending_payment";
  if (["processing", "shipped", "delivered"].includes(order.status))
    return paid ? order.status : "inconsistent";
  return "inconsistent";
}

// مشکل موجودی در سفارشی که لغو نشده
export const needsAttention = (order) =>
  Boolean(order.stockDeductionFailed) && order.status !== "canceled";

// فاکتور و برچسب فقط برای سفارش پرداخت‌شده و لغونشده
export const isPrintable = (order) =>
  order.paymentStatus === "paid" && order.status !== "canceled";
