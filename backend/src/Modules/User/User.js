import express from "express";
import * as UserCn from "./UserCn.js";
import { updateProfileSchema, addressSchema, changePasswordSchema } from "./UserVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/me", UserCn.getMe);
router.patch("/me", validate(updateProfileSchema), UserCn.updateMe);
router.patch("/me/address", validate(addressSchema), UserCn.setAddress);
router.patch("/me/password", validate(changePasswordSchema), UserCn.changePassword);

router.get("/", authorize("admin"), UserCn.listUsers);
router.patch("/:id/toggle-block", authorize("admin"), UserCn.toggleBlock);

export default router;
