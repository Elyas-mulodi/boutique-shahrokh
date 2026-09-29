import express from "express";
import * as CouponCn from "./CouponCn.js";
import { createCouponSchema, applyCouponSchema } from "./CouponVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/preview", validate(applyCouponSchema), CouponCn.previewCoupon);

router.use(authorize("admin"));
router.post("/", validate(createCouponSchema), CouponCn.create);
router.get("/", CouponCn.list);
router.patch("/:id/toggle", CouponCn.toggleActive);
router.delete("/:id", CouponCn.remove);

export default router;