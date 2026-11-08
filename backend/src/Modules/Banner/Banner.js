import express from "express";
import * as BannerCn from "./BannerCn.js";
import { createBannerSchema, updateBannerSchema } from "./BannerVl.js";
import validate from "../../Middlewares/validate.js";
import { protect, authorize } from "../../Middlewares/auth.js";

const router = express.Router();

// عمومی
router.get("/", BannerCn.list);

// ادمین
router.use(protect, authorize("admin"));
router.get("/admin/list", BannerCn.adminList);
router.get("/admin/:id", BannerCn.adminGetById);
router.post("/", validate(createBannerSchema), BannerCn.create);
router.patch("/:id", validate(updateBannerSchema), BannerCn.update);
router.delete("/:id", BannerCn.remove);

export default router;

// توی app.js: app.use("/api/banners", bannerRouter);