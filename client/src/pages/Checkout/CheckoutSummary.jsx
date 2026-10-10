import { formatToman } from "../../constants/storeInfo";

function CheckoutSummary({
  items,
  discountAmount = 0,
  shipping,
  onRetryShipping,
}) {
  const rawTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = shipping.status === "succeeded" ? shipping.data.cost : 0;
  const payable = rawTotal - discountAmount + shippingCost;

  return (
    <div className="space-y-2.5 text-sm font-body">
      <div className="flex justify-between text-ink/60">
        <span>جمع جزء</span>
        <span>{formatToman(rawTotal)}</span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between text-blue">
          <span>تخفیف</span>
          <span>- {formatToman(discountAmount)}</span>
        </div>
      )}

      <div className="flex justify-between text-ink/60 gap-3">
        <span className="flex-shrink-0">هزینه ارسال</span>
        {shipping.status === "idle" && (
          <span className="text-ink/40 text-xs text-left">
            با وارد کردن شهر مشخص می‌شود
          </span>
        )}
        {shipping.status === "loading" && (
          <span className="text-ink/40">در حال محاسبه...</span>
        )}
        {shipping.status === "failed" && (
          <button
            type="button"
            onClick={onRetryShipping}
            className="text-blue text-xs hover:underline"
          >
            خطا در محاسبه، تلاش دوباره
          </button>
        )}
        {shipping.status === "succeeded" && (
          <span>{formatToman(shipping.data.cost)}</span>
        )}
      </div>

      {shipping.status === "succeeded" && (
        <p className="text-xs text-ink/40 text-left">
          ارسال به {shipping.data.zone === "mashhad" ? "مشهد" : "سایر شهرها"} •{" "}
          {shipping.data.time}
        </p>
      )}

      <div className="border-t border-ink/10 pt-2.5 flex justify-between font-heading font-bold text-ink text-base">
        <span>مبلغ قابل پرداخت</span>
        <span>{formatToman(payable)}</span>
      </div>

      {shipping.status !== "succeeded" && (
        <p className="text-xs text-ink/40">
          مبلغ نهایی پس از محاسبه هزینه ارسال مشخص می‌شود.
        </p>
      )}
    </div>
  );
}

export default CheckoutSummary;
