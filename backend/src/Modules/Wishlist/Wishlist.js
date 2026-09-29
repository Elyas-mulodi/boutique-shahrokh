import express from "express";
import * as WishlistCn from "./WishlistCn.js";
import { protect } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", WishlistCn.getWishlist);
router.post("/", WishlistCn.addProduct);
router.delete("/:productId", WishlistCn.removeProduct);

export default router;