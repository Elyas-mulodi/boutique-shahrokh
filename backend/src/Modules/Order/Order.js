import express from "express";
import * as OrderCn from "./OrderCn.js";
import { createOrderSchema, updateStatusSchema } from "./OrderVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createOrderSchema), OrderCn.createOrder);
router.get("/my", OrderCn.getMyOrders);
router.get("/shipping-quote", OrderCn.getShippingQuote);

router.get("/", authorize("admin"), OrderCn.listAllOrders);
router.get("/:id", OrderCn.getOrderById);
router.patch("/:id/status", authorize("admin"), validate(updateStatusSchema), OrderCn.updateOrderStatus);

router.delete("/:id", OrderCn.deleteMyOrder);

export default router;