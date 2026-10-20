import express from "express";
import * as CouponCn from "./CouponCn.js";
import { createCouponSchema, updateCouponSchema, applyCouponSchema } from "./CouponVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/preview", validate(applyCouponSchema), CouponCn.previewCoupon);

router.use(authorize("admin"));
router.get("/", CouponCn.list);
router.post("/", validate(createCouponSchema), CouponCn.create);
router.patch("/:id", validate(updateCouponSchema), CouponCn.update);
router.delete("/:id", CouponCn.remove);

export default router;
