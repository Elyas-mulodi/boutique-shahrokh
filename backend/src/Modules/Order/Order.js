import express from "express";
import * as OrderCn from "./OrderCn.js";
import { createOrderSchema } from "./OrderVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createOrderSchema), OrderCn.createOrder);
router.get("/my", OrderCn.getMyOrders);
router.get("/shipping-quote", OrderCn.getShippingQuote); 
router.get("/:id", OrderCn.getOrderById);
router.delete("/:id", OrderCn.deleteMyOrder);

router.get("/", authorize("admin"), OrderCn.listAllOrders);
router.patch("/:id/status", authorize("admin"), OrderCn.updateOrderStatus);

export default router;
