import express from "express";
import { verifyCallback } from "./PaymentCn.js";

const router = express.Router();

router.get("/verify", verifyCallback);

export default router;