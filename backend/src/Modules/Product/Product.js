import express from "express";
import * as ProductCn from "./ProductCn.js";
import { createProductSchema, updateProductSchema } from "./ProductVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

// عمومی (ترتیب مهمه: best-sellers قبل از /:slug)
router.get("/", ProductCn.list);
router.get("/best-sellers", ProductCn.getBestSellers);
router.get("/:slug", ProductCn.getBySlug);

// ادمین
router.use(protect, authorize("admin"));
router.get("/admin/list", ProductCn.adminList);
router.get("/admin/:id", ProductCn.adminGetById);
router.post("/", validate(createProductSchema), ProductCn.create);
router.patch("/:id", validate(updateProductSchema), ProductCn.update);
router.delete("/:id", ProductCn.remove);

export default router;