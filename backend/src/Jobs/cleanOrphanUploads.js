import cron from "node-cron";
import logger from "../Config/logger.js";
import { sweepOrphanUploads } from "../Utils/files.js";

// هر شب ساعت ۴ صبح
export function startCleanOrphanUploadsJob() {
  logger.info("🕒 job پاکسازی تصاویر بدون استفاده فعال شد");

  cron.schedule("0 4 * * *", async () => {
    try {
      const removed = await sweepOrphanUploads();
      if (removed > 0) logger.info(`🧹 ${removed} تصویر بدون استفاده پاک شد`);
    } catch (err) {
      logger.error(`خطا در job پاکسازی تصاویر: ${err.message}`);
    }
  });
}