import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.PORT) || 5000;
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const env = {
  NODE_ENV: nodeEnv,
  PORT: port,
  TRUST_PROXY: Number(process.env.TRUST_PROXY) || 0,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  OTP_EXPIRE_MINUTES: Number(process.env.OTP_EXPIRE_MINUTES) || 2,
  ORDER_EXPIRE_MINUTES: Number(process.env.ORDER_EXPIRE_MINUTES) || 30,
  UNPAID_ORDER_DELETE_HOURS: Number(process.env.UNPAID_ORDER_DELETE_HOURS) || 24,

  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID,
  ZARINPAL_SANDBOX: process.env.ZARINPAL_SANDBOX === "true",
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL,
  ZARINPAL_AMOUNT_UNIT: process.env.ZARINPAL_AMOUNT_UNIT, // toman | rial

  KAVENEGAR_API_KEY: process.env.KAVENEGAR_API_KEY,
  KAVENEGAR_OTP_TEMPLATE: process.env.KAVENEGAR_OTP_TEMPLATE,

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:5174",
  PUBLIC_URL: process.env.PUBLIC_URL || `http://localhost:${port}`,
};

const problems = [];

["MONGO_URI", "JWT_SECRET", "ZARINPAL_MERCHANT_ID", "ZARINPAL_CALLBACK_URL"].forEach((key) => {
  if (!env[key]) problems.push(`متغیر ${key} تنظیم نشده است`);
});

if (!["toman", "rial"].includes(env.ZARINPAL_AMOUNT_UNIT)) {
  problems.push("ZARINPAL_AMOUNT_UNIT باید toman یا rial باشد (با پرداخت sandbox تست کنید)");
}

if (isProduction) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET === "change_this_secret") {
    problems.push("JWT_SECRET در production باید حداقل ۳۲ کاراکتر و تصادفی باشد");
  }
  if (!env.KAVENEGAR_API_KEY || !env.KAVENEGAR_OTP_TEMPLATE) {
    problems.push(
      "تنظیمات پیامک (KAVENEGAR_API_KEY و KAVENEGAR_OTP_TEMPLATE) در production الزامی است"
    );
  }
}

if (problems.length > 0) {
  console.error("❌ تنظیمات نامعتبر:");
  problems.forEach((p) => console.error(`   - ${p}`));
  process.exit(1);
}

if (isProduction && env.ZARINPAL_SANDBOX) {
  console.warn("⚠️ ZARINPAL_SANDBOX در production روشن است؛ پرداخت‌ها واقعی نیستند");
}

export default env;
