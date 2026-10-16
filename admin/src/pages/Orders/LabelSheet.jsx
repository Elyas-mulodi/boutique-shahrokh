import { STORE } from "../../constants/store";
import { orderCode } from "../../utils/orderState";
import { formatNumber } from "../../utils/format";

function LabelSheet({ order }) {
  const { address } = order;
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="border-2 border-black p-4 text-black">
      <div className="border-b border-black pb-3 text-xs leading-5">
        <p className="font-bold">فرستنده: {STORE.name}</p>
        <p>{STORE.address}</p>
        <p dir="ltr" style={{ textAlign: "right" }}>
          {STORE.phoneDisplay}
        </p>
      </div>

      <div className="py-4">
        <p className="mb-2 text-xs font-bold">گیرنده</p>
        <p className="text-xl font-bold leading-8">{address.receiverName}</p>
        <p className="mt-1 text-base font-bold" dir="ltr" style={{ textAlign: "right" }}>
          {address.receiverPhone}
        </p>
        <p className="mt-3 text-sm leading-7">
          {address.province}، {address.city}
          <br />
          {address.fullAddress}
        </p>
        <p className="mt-3 text-base font-bold">
          کد پستی: <span dir="ltr">{address.postalCode}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black pt-3 text-xs">
        <span>
          سفارش <span dir="ltr">#{orderCode(order._id)}</span> • {formatNumber(quantity)} عدد
        </span>
        {order.trackingCode && (
          <span>
            رهگیری: <span dir="ltr">{order.trackingCode}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default LabelSheet;