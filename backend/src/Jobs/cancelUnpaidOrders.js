import cron from "node-cron";
import OrderMd from "../Modules/Order/OrderMd.js";
import env from "../Config/env.js";
import logger from "../Config/logger.js";

export function startCancelUnpaidOrdersJob() {
  cron.schedule("*/5 * * * *", async () => {
    const cutoff = new Date(Date.now() - env.ORDER_EXPIRE_MINUTES * 60 * 1000);

    try {
      const result = await OrderMd.updateMany(
        { status: "pending_payment", paymentStatus: "pending", createdAt: { $lt: cutoff } },
        { status: "canceled", paymentStatus: "failed" }
      );

      if (result.modifiedCount > 0) {
        logger.info(`🕒 ${result.modifiedCount} سفارش پرداخت‌نشده منقضی و لغو شد`);
      }
    } catch (err) {
      logger.error(`خطا در job لغو سفارش‌ها: ${err.message}`);
    }
  });
}