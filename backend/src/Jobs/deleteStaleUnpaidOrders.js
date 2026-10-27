import cron from "node-cron";
import OrderMd from "../Modules/Order/OrderMd.js";
import CouponMd from "../Modules/Coupon/CouponMd.js";
import env from "../Config/env.js";
import logger from "../Config/logger.js";
import { reconcileUnverifiedPayments } from "./reconcilePayments.js";

export function startDeleteStaleUnpaidOrdersJob() {
  logger.info("🕒 job حذف سفارش‌های پرداخت‌نشده فعال شد");

  cron.schedule("0 * * * *", async () => {
    try {
      const reconcile = await reconcileUnverifiedPayments();
      if (!reconcile.ok) {
        logger.warn("حذف سفارش‌های پرداخت‌نشده به‌خاطر خطا در استعلام درگاه انجام نشد");
        return;
      }

      const cutoff = new Date(Date.now() - env.UNPAID_ORDER_DELETE_HOURS * 60 * 60 * 1000);

      const stale = await OrderMd.find({
        paymentStatus: { $in: ["pending", "failed"] },
        createdAt: { $lt: cutoff },
      }).select("_id");

      let deleted = 0;

      for (const { _id } of stale) {
        const removed = await OrderMd.findOneAndDelete({
          _id,
          paymentStatus: { $in: ["pending", "failed"] },
        });
        if (!removed) continue;

        deleted += 1;

        if (removed.couponCode) {
          await CouponMd.updateOne(
            { code: removed.couponCode, usedCount: { $gt: 0 } },
            { $inc: { usedCount: -1 } }
          );
        }
      }

      if (deleted > 0) logger.info(`🗑️ ${deleted} سفارش پرداخت‌نشده‌ی قدیمی حذف شد`);
    } catch (err) {
      logger.error(`خطا در job حذف سفارش‌های پرداخت‌نشده: ${err.message}`);
    }
  });
}
