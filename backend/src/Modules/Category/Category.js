import express from "express";
import * as CategoryCn from "./CategoryCn.js";
import { createCategorySchema, updateCategorySchema } from "./CategoryVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.get("/", CategoryCn.getTree); // عمومی
router.get("/:slug", CategoryCn.getBySlug); // عمومی

router.use(protect, authorize("admin"));
router.get("/admin/list", CategoryCn.adminList);
router.post("/", validate(createCategorySchema), CategoryCn.create);
router.patch("/:id", validate(updateCategorySchema), CategoryCn.update);
router.delete("/:id", CategoryCn.remove);

export default router;