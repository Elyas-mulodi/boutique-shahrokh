function CheckoutSummary({ items, discountAmount = 0 }) {
  const rawTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const payable = rawTotal - discountAmount;

  return (
    <div className="space-y-2.5 text-sm font-body">
      <div className="flex justify-between text-ink/60">
        <span>جمع جزء</span>
        <span>{rawTotal.toLocaleString("fa-IR")} تومان</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-blue">
          <span>تخفیف</span>
          <span>- {discountAmount.toLocaleString("fa-IR")} تومان</span>
        </div>
      )}
      <div className="border-t border-ink/10 pt-2.5 flex justify-between font-heading font-bold text-ink text-base">
        <span>مبلغ قابل پرداخت</span>
        <span>{payable.toLocaleString("fa-IR")} تومان</span>
      </div>
    </div>
  );
}

export default CheckoutSummary;