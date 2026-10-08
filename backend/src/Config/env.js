import dotenv from "dotenv";
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  OTP_EXPIRE_MINUTES: Number(process.env.OTP_EXPIRE_MINUTES) || 2,

  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID,
  ZARINPAL_SANDBOX: process.env.ZARINPAL_SANDBOX === "true",
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL,

  ORDER_EXPIRE_MINUTES: Number(process.env.ORDER_EXPIRE_MINUTES) || 30,

  UNPAID_ORDER_DELETE_HOURS: Number(process.env.UNPAID_ORDER_DELETE_HOURS) || 24,
};

const required = ["MONGO_URI", "JWT_SECRET", "ZARINPAL_MERCHANT_ID", "ZARINPAL_CALLBACK_URL"];
required.forEach((key) => {
  if (!env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

export default env;
