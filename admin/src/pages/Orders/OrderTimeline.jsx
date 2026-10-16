import Card from "../../components/ui/Card";
import { formatJalaliDateTime } from "../../utils/format";

const LABELS = {
  processing: "پرداخت موفق • شروع پردازش",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
  canceled: "لغو شد",
  pending_payment: "در انتظار پرداخت",
};

function OrderTimeline({ order }) {
  const events = [
    { key: "created", label: "ثبت سفارش", at: order.createdAt, by: null },
    ...(order.statusHistory || []).map((h, index) => ({
      key: `h-${index}`,
      label: h.note || LABELS[h.status] || h.status,
      at: h.at,
      by: h.by?.name || null,
    })),
  ];

  return (
    <Card>
      <h3 className="mb-4 font-heading font-bold text-ink">تاریخچه سفارش</h3>
      <ol className="relative space-y-5 pr-5">
        <span className="absolute bottom-1 right-[5px] top-1 w-px bg-ink/10" />
        {events.map((event, index) => (
          <li key={event.key} className="relative">
            <span
              className={`absolute -right-5 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white ${
                index === events.length - 1 ? "bg-blue" : "bg-ink/30"
              }`}
            />
            <p className="text-sm font-bold text-ink">{event.label}</p>
            <p className="mt-0.5 text-xs text-ink/40">
              {formatJalaliDateTime(event.at)}
              {event.by ? ` • ${event.by}` : ""}
            </p>
          </li>
        ))}
      </ol>
      {!(order.statusHistory || []).length && (
        <p className="mt-4 text-xs leading-6 text-ink/40">
          برای سفارش‌های قدیمی، تاریخچه‌ی تغییر وضعیت ثبت نشده است.
        </p>
      )}
    </Card>
  );
}

export default OrderTimeline;