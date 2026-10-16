import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, FileText, Tag } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import { OrderStatusBadge, PaymentBadge } from "./OrderBadges";
import OrderActions from "./OrderActions";
import OrderItemsCard from "./OrderItemsCard";
import OrderSummaryCard from "./OrderSummaryCard";
import OrderCustomerCard from "./OrderCustomerCard";
import OrderPaymentCard from "./OrderPaymentCard";
import OrderTimeline from "./OrderTimeline";
import { useAsync } from "../../hooks/useAsync";
import { getOrder } from "../../services/orderApi";
import { isPrintable, needsAttention, orderCode } from "../../utils/orderState";
import { formatJalaliDateTime } from "../../utils/format";

const printLink =
  "inline-flex h-9 items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-bold text-ink transition-colors hover:border-ink";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
      <ArrowRight size={16} />
      بازگشت به سفارش‌ها
    </Link>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const state = useAsync(() => getOrder(id), [id]);
  const order = state.data && String(state.data._id) === id ? state.data : null;

  if (!order && state.error) {
    const notFound = state.errorStatus === 404 || state.errorStatus === 400;
    return (
      <>
        <BackLink />
        <Card>
          {notFound ? (
            <div className="py-10 text-center">
              <p className="font-heading font-bold text-ink">سفارش پیدا نشد</p>
              <p className="mt-1 text-sm text-ink/50">ممکن است این سفارش حذف شده باشد.</p>
            </div>
          ) : (
            <ErrorState message={state.error} onRetry={state.reload} />
          )}
        </Card>
      </>
    );
  }

  if (!order) return <DetailSkeleton />;

  const printable = isPrintable(order);

  return (
    <>
      <BackLink />

      <PageHeader
        title={
          <>
            سفارش <span dir="ltr">#{orderCode(order._id)}</span>
          </>
        }
        description={`ثبت‌شده در ${formatJalaliDateTime(order.createdAt)}`}
        actions={
          printable && (
            <>
              <a href={`/orders/${order._id}/print/invoice`} target="_blank" rel="noopener noreferrer" className={printLink}>
                <FileText size={15} />
                چاپ فاکتور
              </a>
              <a href={`/orders/${order._id}/print/label`} target="_blank" rel="noopener noreferrer" className={printLink}>
                <Tag size={15} />
                برچسب پستی
              </a>
            </>
          )
        }
      />

      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2">
        <OrderStatusBadge order={order} />
        <PaymentBadge status={order.paymentStatus} />
      </div>

      {needsAttention(order) && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-7 text-orange-800">
          <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
          <p>
            هنگام پرداخت، موجودی بعضی اقلام کافی نبود و کسر نشد (در لیست اقلام مشخص شده‌اند). موجودی انبار را بررسی و
            در صورت نیاز با مشتری هماهنگ کنید، سپس با «مشکل موجودی رسیدگی شد» این علامت را بردارید.
          </p>
        </div>
      )}

      <div className="mb-6">
        <OrderActions order={order} onChanged={state.reload} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsCard order={order} />
          <OrderTimeline order={order} />
        </div>
        <div className="space-y-6">
          <OrderSummaryCard order={order} />
          <OrderCustomerCard order={order} />
          <OrderPaymentCard order={order} />
        </div>
      </div>
    </>
  );
}

export default OrderDetailPage;