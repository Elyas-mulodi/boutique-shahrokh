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
  message: { success: false, message: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" },
});
app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Boutique Shahrokh API is running 🟢" });
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;