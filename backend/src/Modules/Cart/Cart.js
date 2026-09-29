import express from "express";
import * as CartCn from "./CartCn.js";
import { addItemSchema, updateItemSchema } from "./CartVl.js";
import validate from "../../Middlewares/validate.js";
import { protect } from "../../Middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", CartCn.getCart);
router.post("/items", validate(addItemSchema), CartCn.addItem);
router.patch("/items/:itemId", validate(updateItemSchema), CartCn.updateItem);
router.delete("/items/:itemId", CartCn.removeItem);
router.delete("/", CartCn.clearCart);

export default router;