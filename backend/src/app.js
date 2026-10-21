import path from "path";
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
import CouponRoutes from "./Modules/Coupon/Coupon.js";
import MediaRoutes from "./Modules/Media/Media.js";
import DashboardRoutes from "./Modules/Dashboard/Dashboard.js";

const app = express();

const allowedOrigins = [env.CLIENT_URL, env.ADMIN_URL].filter(Boolean);
const isProduction = env.NODE_ENV === "production";

const makeLimiter = (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

const generalLimiter = makeLimiter(600, "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید");
const authLimiter = makeLimiter(
  isProduction ? 30 : 300,
  "تعداد تلاش‌ها بیش از حد مجاز است، ۱۵ دقیقه دیگر دوباره تلاش کنید"
);
const otpLimiter = makeLimiter(
  isProduction ? 5 : 100,
  "تعداد درخواست کد تایید بیش از حد مجاز است، بعداً دوباره تلاش کنید"
);

app.use(helmet());
app.use(
  cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.resolve("uploads"), { maxAge: "7d", index: false })
);

app.use("/api", generalLimiter);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/auth/forgot-password", otpLimiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Boutique Shahrokh API is running 🟢" });
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/products", ProductRoutes);
app.use("/api/v1/cart", CartRoutes);
app.use("/api/v1/orders", OrderRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/coupons", CouponRoutes);
app.use("/api/v1/media", MediaRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
