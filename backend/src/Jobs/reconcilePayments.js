import env from "../Config/env.js";
import logger from "../Config/logger.js";
import OrderMd from "../Modules/Order/OrderMd.js";
import { markOrderPaidAndDeductStock } from "../Modules/Order/OrderCn.js";
import {
  fromGatewayAmount,
  listUnverifiedPayments,
  verifyZarinpalPayment,
} from "../Utils/zarinpal.js";

const reported = new Set(); 

function reportOnce(key, message) {
  if (reported.has(key)) return;
  reported.add(key);
  logger.error(message);
}

export async function reconcileUnverifiedPayments() {
  if (env.ZARINPAL_SANDBOX) return { ok: true, skipped: true, recovered: 0 };

  let unverified;
  try {
    unverified = await listUnverifiedPayments();
  } catch (err) {
    logger.warn(`استعلام تراکنش‌های تاییدنشده ناموفق بود: ${err.message}`);
    return { ok: false, recovered: 0 };
  }

  let recovered = 0;

  for (const item of unverified) {
    try {
      const order = await OrderMd.findOne({ paymentAuthority: item.authority });

      if (!order) {
        reportOnce(
          `orphan:${item.authority}`,
          `💰 پرداخت تاییدنشده بدون سفارش: authority=${item.authority} مبلغ=${item.amount} (نیازمند بررسی دستی)`
        );
        continue;
      }
      if (order.paymentStatus === "paid") continue;

      if (fromGatewayAmount(item.amount) !== order.totalAmount) {
        reportOnce(
          `mismatch:${item.authority}`,
          `⚠️ مبلغ پرداخت با سفارش ${order._id} نمی‌خواند (درگاه: ${item.amount}، سفارش: ${order.totalAmount})`
        );
        continue;
      }

      const result = await verifyZarinpalPayment({
        authority: item.authority,
        amount: order.totalAmount,
      });
      if (!result.ok) continue;

      await markOrderPaidAndDeductStock(order, result.refId);
      recovered += 1;
      logger.info(`✅ پرداخت بازیابی شد: سفارش ${order._id}`);
    } catch (err) {
      logger.error(`خطا در بازیابی پرداخت ${item.authority}: ${err.message}`);
    }
  }

  return { ok: true, recovered };
}
