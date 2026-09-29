import express from "express";
import * as DashboardCn from "./DashboardCn.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/overview", DashboardCn.getOverview);
router.get("/sales-chart", DashboardCn.getSalesChart);
router.get("/top-products", DashboardCn.getTopProducts);
router.get("/order-status", DashboardCn.getOrderStatusBreakdown);
router.get("/sales-by-category", DashboardCn.getSalesByCategory);
router.get("/recent-orders", DashboardCn.getRecentOrders);
router.get("/low-stock", DashboardCn.getLowStockProducts);
router.get("/top-customers", DashboardCn.getTopCustomers);

export default router;