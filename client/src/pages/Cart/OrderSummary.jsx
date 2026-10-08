import { Link } from "react-router-dom";

function OrderSummary({ items }) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-ink/5 rounded-2xl p-6 sticky top-24">
      <h3 className="font-heading text-ink font-bold mb-4">خلاصه سفارش</h3>

      <div className="space-y-2.5 text-sm font-body">
        <div className="flex justify-between text-ink/60">
          <span>تعداد کالا</span>
          <span>{itemsCount.toLocaleString("fa-IR")}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>جمع جزء</span>
          <span>{total.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>

      <div className="border-t border-ink/10 my-4" />

      <div className="flex justify-between font-heading font-bold text-ink text-base">
        <span>مبلغ قابل پرداخت</span>
        <span>{total.toLocaleString("fa-IR")} تومان</span>
      </div>

      <Link
        to="/checkout"
        className="block text-center mt-6 bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors"
      >
        ادامه فرآیند خرید
      </Link>
    </div>
  );
}

export default OrderSummary;