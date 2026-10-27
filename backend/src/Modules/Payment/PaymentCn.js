import asyncHandler from "../../Utils/asyncHandler.js";
import env from "../../Config/env.js";
import logger from "../../Config/logger.js";
import OrderMd from "../Order/OrderMd.js";
import { markOrderPaidAndDeductStock } from "../Order/OrderCn.js";
import { verifyZarinpalPayment } from "../../Utils/zarinpal.js";

export const verifyCallback = asyncHandler(async (req, res) => {
  const redirect = (path) => res.redirect(`${env.CLIENT_URL}${path}`);

  const { Authority: authority, Status: gatewayStatus } = req.query;
  if (typeof authority !== "string" || !authority)
    return redirect("/payment/failed?reason=invalid");

  const order = await OrderMd.findOne({ paymentAuthority: authority });
  if (!order) return redirect("/payment/failed?reason=order_not_found");

  // callback تکراری
  if (order.paymentStatus === "paid") return redirect(`/payment/success?orderId=${order._id}`);

  // مشتری پرداخت رو لغو کرده یا بانک رد کرده
  if (gatewayStatus !== "OK") {
    await OrderMd.updateOne(
      { _id: order._id, paymentStatus: { $ne: "paid" } },
      { $set: { paymentStatus: "failed", status: "canceled", canceledAt: new Date() } }
    );
    return redirect(`/payment/failed?orderId=${order._id}`);
  }

  const result = await verifyZarinpalPayment({ authority, amount: order.totalAmount });

  if (result.ok) {
    await markOrderPaidAndDeductStock(order, result.refId);
    return redirect(`/payment/success?orderId=${order._id}`);
  }

  logger.warn(
    `تایید پرداخت سفارش ${order._id} انجام نشد (code=${result.code ?? "-"}, network=${Boolean(result.networkError)})؛ سفارش برای بررسی بعدی نگه داشته شد`
  );

  return redirect(
    `/payment/failed?orderId=${order._id}&reason=${result.networkError ? "verify_pending" : "verify_failed"}`
  );
});
