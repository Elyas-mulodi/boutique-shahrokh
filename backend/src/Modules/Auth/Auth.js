import express from "express";
import * as AuthCn from "./AuthCn.js";
import { registerSchema, loginSchema, requestOtpSchema, resetPasswordSchema } from "./AuthVl.js";
import validate from "../../Middlewares/validate.js";

const router = express.Router();

router.post("/register", validate(registerSchema), AuthCn.register);
router.post("/login", validate(loginSchema), AuthCn.login);
router.post("/forgot-password", validate(requestOtpSchema), AuthCn.requestOtp);
router.post("/reset-password", validate(resetPasswordSchema), AuthCn.resetPassword);

export default router;