import cron from "node-cron";
import OrderMd from "../Modules/Order/OrderMd.js";
import CouponMd from "../Modules/Coupon/CouponMd.js";
import env from "../Config/env.js";
import logger from "../Config/logger.js";


export function startDeleteStaleUnpaidOrdersJob() {
  cron.schedule("0 * * * *", async () => {
    const cutoff = new Date(Date.now() - env.UNPAID_ORDER_DELETE_HOURS * 60 * 60 * 1000);

    try {
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

      if (deleted > 0) {
        logger.info(`🗑️ ${deleted} سفارش پرداخت‌نشده‌ی قدیمی حذف شد`);
      }
    } catch (err) {
      logger.error(`خطا در job حذف سفارش‌های پرداخت‌نشده: ${err.message}`);
    }
  });
}