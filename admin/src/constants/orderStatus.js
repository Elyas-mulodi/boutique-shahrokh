export const ORDER_STATUS = {
  pending_payment: {
    label: "در انتظار پرداخت",
    short: "در انتظار پرداخت",
    color: "#94A3B8",
    tone: "neutral",
    counted: false,
  },
  processing: {
    label: "در حال پردازش",
    short: "در حال پردازش",
    color: "#2D4FFF",
    tone: "blue",
    counted: true,
  },
  shipped: {
    label: "ارسال‌شده",
    short: "ارسال‌شده",
    color: "#0891B2",
    tone: "teal",
    counted: true,
  },
  delivered: {
    label: "تحویل‌شده",
    short: "تحویل‌شده",
    color: "#16A34A",
    tone: "success",
    counted: true,
  },
  canceled_paid: {
    label: "لغو‌شده (پرداخت‌شده)",
    short: "لغو‌شده",
    color: "#DC2626",
    tone: "danger",
    counted: false,
  },
  canceled_unpaid: {
    label: "لغو/منقضی (پرداخت‌نشده)",
    short: "لغو/منقضی",
    color: "#CBD5E1",
    tone: "neutral",
    counted: false,
  },
  inconsistent: {
    label: "نیازمند بررسی",
    short: "نیازمند بررسی",
    color: "#EA580C",
    tone: "warning",
    counted: false,
  },
};

// برچسب وضعیت واقعی سفارش‌های پرداخت‌شده (کارت «آخرین سفارش‌ها»)
export const ORDER_STATUS_BADGE = {
  pending_payment: { label: "در انتظار پرداخت", tone: "neutral" },
  processing: { label: "در حال پردازش", tone: "blue" },
  shipped: { label: "ارسال‌شده", tone: "teal" },
  delivered: { label: "تحویل‌شده", tone: "success" },
  canceled: { label: "لغو شده", tone: "danger" },
};
