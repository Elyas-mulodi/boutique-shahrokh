import { STORE } from "../../constants/store";
import { orderCode } from "../../utils/orderState";
import { formatJalaliDate, formatNumber, formatToman } from "../../utils/format";

function InvoiceSheet({ order }) {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmount || 0;
  const shipping = order.shippingCost || 0;
  const other = order.totalAmount - (itemsTotal - discount + shipping);
  const { address } = order;

  return (
    <div className="p-8 text-sm text-black print:p-0">
      <div className="flex items-start justify-between gap-6 border-b-2 border-black pb-5">
        <div>
          <h1 className="text-xl font-bold">{STORE.name}</h1>
          <p className="mt-1 leading-6">{STORE.address}</p>
          <p className="mt-0.5" dir="ltr" style={{ textAlign: "right" }}>
            {STORE.phoneDisplay}
          </p>
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold">فاکتور فروش</h2>
          <p className="mt-1">
            شماره: <span dir="ltr">#{orderCode(order._id)}</span>
          </p>
          <p className="mt-0.5">تاریخ: {formatJalaliDate(order.paidAt || order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1 font-bold">خریدار</p>
          <p>{order.user?.name || "—"}</p>
          <p dir="ltr" style={{ textAlign: "right" }}>
            {order.user?.phone || ""}
          </p>
        </div>
        <div>
          <p className="mb-1 font-bold">تحویل‌گیرنده</p>
          <p>
            {address.receiverName} •{" "}
            <span dir="ltr">{address.receiverPhone}</span>
          </p>
          <p className="mt-0.5 leading-6">
            {address.province}، {address.city}، {address.fullAddress}
          </p>
          <p>
            کد پستی: <span dir="ltr">{address.postalCode}</span>
          </p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="w-10 py-2 text-start">ردیف</th>
            <th className="py-2 text-start">کالا</th>
            <th className="w-16 py-2 text-center">تعداد</th>
            <th className="w-32 py-2 text-end">قیمت واحد</th>
            <th className="w-36 py-2 text-end">مبلغ</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={`${item.variantId}-${index}`} className="border-b border-black/20">
              <td className="py-2">{formatNumber(index + 1)}</td>
              <td className="py-2">
                {item.name}
                <span className="block text-xs text-black/60">
                  سایز {item.size} • رنگ {item.color}
                </span>
              </td>
              <td className="py-2 text-center">{formatNumber(item.quantity)}</td>
              <td className="py-2 text-end">{formatToman(item.price)}</td>
              <td className="py-2 text-end">{formatToman(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mr-auto mt-5 w-72 space-y-1.5">
        <div className="flex justify-between">
          <span>جمع کالاها</span>
          <span>{formatToman(itemsTotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>تخفیف{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span>- {formatToman(discount)}</span>
          </div>
        )}
        {shipping > 0 && (
          <div className="flex justify-between">
            <span>هزینه ارسال</span>
            <span>{formatToman(shipping)}</span>
          </div>
        )}
        {other !== 0 && (
          <div className="flex justify-between">
            <span>سایر</span>
            <span>{formatToman(other)}</span>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-black pt-2 text-base font-bold">
          <span>مبلغ نهایی</span>
          <span>{formatToman(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/20 pt-4 text-xs">
        <span>
          وضعیت پرداخت: پرداخت‌شده
          {order.paymentRefId ? (
            <>
              {" "}
              • کد پیگیری بانک: <span dir="ltr">{order.paymentRefId}</span>
            </>
          ) : null}
        </span>
        {order.trackingCode && (
          <span>
            کد رهگیری مرسوله: <span dir="ltr">{order.trackingCode}</span>
          </span>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-black/60">از خرید شما سپاسگزاریم.</p>
    </div>
  );
}

export default InvoiceSheet;