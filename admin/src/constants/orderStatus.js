// دسته‌های نمودار وضعیت (کلیدها با خروجی order-status بک‌اند یکی است)
export const ORDER_STATUS = {
  pending_payment: { label: "در انتظار پرداخت", color: "#94A3B8", counted: false },
  processing: { label: "در حال پردازش", color: "#2D4FFF", counted: true },
  shipped: { label: "ارسال‌شده", color: "#0891B2", counted: true },
  delivered: { label: "تحویل‌شده", color: "#16A34A", counted: true },
  canceled_paid: { label: "لغو‌شده (پرداخت‌شده)", color: "#DC2626", counted: false },
  canceled_unpaid: { label: "لغو/منقضی (پرداخت‌نشده)", color: "#CBD5E1", counted: false },
  inconsistent: { label: "نیازمند بررسی", color: "#EA580C", counted: false },
};

// برچسب وضعیت واقعی هر سفارش (کنار ردیف سفارش‌ها)
export const ORDER_STATUS_BADGE = {
  pending_payment: { label: "در انتظار پرداخت", tone: "neutral" },
  processing: { label: "در حال پردازش", tone: "blue" },
  shipped: { label: "ارسال‌شده", tone: "teal" },
  delivered: { label: "تحویل‌شده", tone: "success" },
  canceled: { label: "لغو شده", tone: "danger" },
};