import express from "express";
import * as ProductCn from "./ProductCn.js";
import { createProductSchema, updateProductSchema } from "./ProductVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.get("/", ProductCn.list); 
router.get("/:slug", ProductCn.getBySlug); 

router.use(protect, authorize("admin"));
router.post("/", validate(createProductSchema), ProductCn.create);
router.patch("/:id", validate(updateProductSchema), ProductCn.update);
router.delete("/:id", ProductCn.remove);

export default router;