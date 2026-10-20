import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import env from "../Config/env.js";
import CouponMd from "../Modules/Coupon/CouponMd.js";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (days) => new Date(Date.now() + days * DAY);

const DEMO = [
  { code: "DEMO20", type: "percent", value: 20, maxDiscount: 200000, minOrderAmount: 500000, usageLimit: null, usedCount: 3, expiresAt: inDays(30) },
  { code: "DEMO50K", type: "fixed", value: 50000, maxDiscount: null, minOrderAmount: 300000, usageLimit: 100, usedCount: 12, expiresAt: inDays(60) },
  { code: "DEMOSOON", type: "percent", value: 5, maxDiscount: null, minOrderAmount: 0, usageLimit: null, usedCount: 0, expiresAt: inDays(1) },
  { code: "DEMOFULL", type: "percent", value: 10, maxDiscount: null, minOrderAmount: 0, usageLimit: 5, usedCount: 5, expiresAt: inDays(30) },
  { code: "DEMOOLD", type: "percent", value: 15, maxDiscount: null, minOrderAmount: 0, usageLimit: null, usedCount: 2, expiresAt: inDays(-10) },
  { code: "DEMOOFF", type: "fixed", value: 100000, maxDiscount: null, minOrderAmount: 0, usageLimit: null, usedCount: 0, expiresAt: inDays(30), isActive: false },
];

async function run() {
  if (env.NODE_ENV === "production") {
    console.error("❌ اجرای این اسکریپت در production مجاز نیست");
    process.exit(1);
  }

  await connectDB();

  await CouponMd.deleteMany({ code: /^DEMO/ });
  await CouponMd.insertMany(DEMO);

  console.log(`✅ ${DEMO.length} کد تخفیف دمو ساخته شد`);
  console.log("وضعیت مورد انتظار: فعال ۳ (DEMO20, DEMO50K, DEMOSOON) | ظرفیت تمام‌شده ۱ | منقضی ۱ | غیرفعال ۱");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ خطا:", err);
  process.exit(1);
});