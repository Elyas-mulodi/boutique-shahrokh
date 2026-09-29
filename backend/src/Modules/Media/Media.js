import express from "express";
import upload from "../../Config/multer.js";
import * as MediaCn from "./MediaCn.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.post("/products", upload.array("images", 6), MediaCn.uploadProductImages);
router.delete("/products/:filename", MediaCn.deleteProductImage);

export default router;