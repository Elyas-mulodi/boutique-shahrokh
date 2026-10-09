import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import ProductMd from "../Modules/Product/ProductMd.js";

const COLOR_HEX = {
  مشکی: "#121212",
  سفید: "#FAFAFA",
  آبی: "#2D4FFF",
  طوسی: "#9CA3AF",
  صورتی: "#F4A6C0",
  "قهوه‌ای": "#7B4B2A",
};

// یکدست‌کردن نوشتار: ی/ک عربی، نیم‌فاصله و فاصله
const normalize = (s) =>
  String(s)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]/g, "");

const HEX_BY_NAME = Object.fromEntries(
  Object.entries(COLOR_HEX).map(([name, hex]) => [normalize(name), hex])
);

async function run() {
  await connectDB();

  const products = await ProductMd.find();
  const unmatched = new Set();
  let updated = 0;

  for (const product of products) {
    let changed = false;

    for (const variant of product.variants) {
      if (variant.colorHex) continue;

      const hex = HEX_BY_NAME[normalize(variant.color)];
      if (hex) {
        variant.colorHex = hex;
        changed = true;
      } else {
        unmatched.add(variant.color);
      }
    }

    if (changed) {
      await product.save();
      updated += 1;
    }
  }

  console.log(`✅ ${updated} محصول به‌روز شد`);
  if (unmatched.size > 0) {
    console.log("⚠️ رنگ‌های بدون کد:", [...unmatched]);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ خطا:", err);
  process.exit(1);
});