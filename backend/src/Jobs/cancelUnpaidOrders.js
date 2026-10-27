import cron from "node-cron";
import OrderMd from "../Modules/Order/OrderMd.js";
import env from "../Config/env.js";
import logger from "../Config/logger.js";
import { reconcileUnverifiedPayments } from "./reconcilePayments.js";

export function startCancelUnpaidOrdersJob() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const reconcile = await reconcileUnverifiedPayments();
      if (!reconcile.ok) return; 

      const cutoff = new Date(Date.now() - env.ORDER_EXPIRE_MINUTES * 60 * 1000);

      const result = await OrderMd.updateMany(
        { status: "pending_payment", paymentStatus: "pending", createdAt: { $lt: cutoff } },
        { $set: { status: "canceled", paymentStatus: "failed", canceledAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        logger.info(`🕒 ${result.modifiedCount} سفارش پرداخت‌نشده منقضی و لغو شد`);
      }
    } catch (err) {
      logger.error(`خطا در job لغو سفارش‌ها: ${err.message}`);
    }
  });
}
