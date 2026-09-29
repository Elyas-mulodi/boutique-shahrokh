import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import env from "./Config/env.js";
import { notFound, errorHandler } from "./Middlewares/errorHandler.js";
import AuthRoutes from "./Modules/Auth/Auth.js";
import UserRoutes from "./Modules/User/User.js";
import CategoryRoutes from "./Modules/Category/Category.js";
import ProductRoutes from "./Modules/Product/Product.js";
import CartRoutes from "./Modules/Cart/Cart.js";
import OrderRoutes from "./Modules/Order/Order.js";
import PaymentRoutes from "./Modules/Payment/Payment.js";
import path from "path";
import { fileURLToPath } from "url";
import MediaRoutes from "./Modules/Media/Media.js";
import DashboardRoutes from "./Modules/Dashboard/Dashboard.js";
import CouponRoutes from "./Modules/Coupon/Coupon.js";
import WishlistRoutes from "./Modules/Wishlist/Wishlist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید",
  },
});
app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Boutique Shahrokh API is running 🟢" });
});

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/products", ProductRoutes);
app.use("/api/v1/cart", CartRoutes);
app.use("/api/v1/orders", OrderRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/media", MediaRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);
app.use("/api/v1/coupons", CouponRoutes);
app.use("/api/v1/wishlist", WishlistRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
