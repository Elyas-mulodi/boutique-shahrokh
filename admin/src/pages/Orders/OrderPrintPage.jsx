import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Printer } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import FullScreenLoader from "../../components/ui/FullScreenLoader";
import NotFoundPage from "../NotFound/NotFoundPage";
import InvoiceSheet from "./InvoiceSheet";
import LabelSheet from "./LabelSheet";
import { useAsync } from "../../hooks/useAsync";
import { getOrder } from "../../services/orderApi";
import { isPrintable } from "../../utils/orderState";

function OrderPrintPage() {
  const { id, type } = useParams();
  const valid = type === "invoice" || type === "label";
  const isLabel = type === "label";

  const state = useAsync(() => getOrder(id), [id]);
  const order = state.data && String(state.data._id) === id ? state.data : null;
  const orderId = order?._id;
  const printable = order ? isPrintable(order) : false;

  // چاپ خودکار بعد از آماده‌شدن صفحه
  useEffect(() => {
    if (!orderId || !valid || !printable) return undefined;
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, [orderId, valid, printable]);

  if (!valid) return <NotFoundPage />;
  if (!order && state.error) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Card>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      </div>
    );
  }
  if (!order) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-ink/5 py-6 print:bg-white print:py-0">
      <style>{`@page { size: ${isLabel ? "105mm 148mm" : "A4"}; margin: ${isLabel ? "5mm" : "12mm"}; }`}</style>

      <div className={`mx-auto mb-4 flex items-center justify-between px-4 print:hidden ${isLabel ? "max-w-[397px]" : "max-w-[794px]"}`}>
        <Link to={`/orders/${order._id}`} className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
          <ArrowRight size={16} />
          بازگشت به سفارش
        </Link>
        {printable && (
          <Button size="sm" icon={Printer} onClick={() => window.print()}>
            چاپ
          </Button>
        )}
      </div>

      {printable ? (
        <div
          className={`mx-auto bg-white shadow-sm print:max-w-none print:shadow-none ${
            isLabel ? "max-w-[397px] p-2 print:p-0" : "max-w-[794px]"
          }`}
        >
          {isLabel ? <LabelSheet order={order} /> : <InvoiceSheet order={order} />}
        </div>
      ) : (
        <Card className="mx-auto max-w-md text-center">
          <p className="font-bold text-ink">برای این سفارش فاکتور صادر نمی‌شود</p>
          <p className="mt-1 text-sm text-ink/50">فاکتور و برچسب فقط برای سفارش‌های پرداخت‌شده و لغونشده است.</p>
        </Card>
      )}
    </div>
  );
}

export default OrderPrintPage;