import express from "express";
import * as CategoryCn from "./CategoryCn.js";
import { createCategorySchema, updateCategorySchema, moveCategorySchema } from "./CategoryVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

// عمومی
router.get("/", CategoryCn.getTree);
router.get("/:slug", CategoryCn.getBySlug);

// ادمین
router.use(protect, authorize("admin"));
router.get("/admin/list", CategoryCn.adminList);
router.post("/", validate(createCategorySchema), CategoryCn.create);
router.patch("/:id", validate(updateCategorySchema), CategoryCn.update);
router.post("/:id/move", validate(moveCategorySchema), CategoryCn.move);
router.delete("/:id", CategoryCn.remove);

export default router;