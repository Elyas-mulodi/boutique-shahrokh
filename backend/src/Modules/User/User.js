import express from "express";
import * as UserCn from "./UserCn.js";
import {
  updateProfileSchema,
  addressSchema,
  changePasswordSchema,
  blockUserSchema,
} from "./UserVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

// کاربر (باید قبل از /:id باشند)
router.get("/me", UserCn.getMe);
router.patch("/me", validate(updateProfileSchema), UserCn.updateMe);
router.patch("/me/address", validate(addressSchema), UserCn.setAddress);
router.patch("/me/password", validate(changePasswordSchema), UserCn.changePassword);

// ادمین
router.get("/", authorize("admin"), UserCn.listUsers);
router.get("/:id", authorize("admin"), UserCn.getUserDetail);
router.patch("/:id/block", authorize("admin"), validate(blockUserSchema), UserCn.setBlocked);

export default router;
