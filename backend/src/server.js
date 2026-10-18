import app from "./app.js";
import env from "./Config/env.js";
import connectDB from "./Config/db.js";
import logger from "./Config/logger.js";
import { startCancelUnpaidOrdersJob } from "./Jobs/cancelUnpaidOrders.js";
import { startDeleteStaleUnpaidOrdersJob } from "./Jobs/deleteStaleUnpaidOrders.js";
import { startCleanOrphanUploadsJob } from "./Jobs/cleanOrphanUploads.js";

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  startCancelUnpaidOrdersJob();
  startDeleteStaleUnpaidOrdersJob();
  startCleanOrphanUploadsJob();

  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

start();
