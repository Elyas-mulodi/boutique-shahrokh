import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import env from "../Config/env.js";
import { calculateShipping } from "../Config/shipping.js";
import { startOfTehranDay, addDays } from "../Utils/dateTehran.js";
import UserMd from "../Modules/User/UserMd.js";
import ProductMd from "../Modules/Product/ProductMd.js";
import OrderMd from "../Modules/Order/OrderMd.js";

const DEMO_PREFIX = "دمو";
const ORDER_COUNT = 80;
const DAY = 24 * 60 * 60 * 1000;

const PLACES = [
  { province: "خراسان رضوی", city: "مشهد" },
  { province: "خراسان رضوی", city: "مشهد" },
  { province: "تهران", city: "تهران" },
  { province: "اصفهان", city: "اصفهان" },
  { province: "فارس", city: "شیراز" },
  { province: "آذربایجان شرقی", city: "تبریز" },
  { province: "خوزستان", city: "اهواز" },
];

const STATUS_PLAN = [
  { key: "delivered", weight: 35 },
  { key: "shipped", weight: 15 },
  { key: "processing", weight: 15 },
  { key: "canceled_paid", weight: 8 },
  { key: "pending_payment", weight: 12 },
  { key: "canceled_unpaid", weight: 10 },
];

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function pickStatus() {
  const total = STATUS_PLAN.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const plan of STATUS_PLAN) {
    r -= plan.weight;
    if (r <= 0) return plan.key;
  }
  return STATUS_PLAN[0].key;
}

const cap = (date) => new Date(Math.min(Date.now(), date.getTime()));

function stateFields(key, createdAt) {
  const paidAt = cap(new Date(createdAt.getTime() + rand(5, 20) * 60000));
  const later = (hours) => cap(new Date(paidAt.getTime() + hours * 3600000));

  switch (key) {
    case "delivered":
      return { status: "delivered", paymentStatus: "paid", paidAt, shippedAt: later(24), deliveredAt: later(72) };
    case "shipped":
      return { status: "shipped", paymentStatus: "paid", paidAt, shippedAt: later(24) };
    case "processing":
      return { status: "processing", paymentStatus: "paid", paidAt };
    case "canceled_paid":
      return { status: "canceled", paymentStatus: "paid", paidAt, canceledAt: later(12), stockRestored: true };
    case "pending_payment":
      return { status: "pending_payment", paymentStatus: "pending" };
    default:
      return { status: "canceled", paymentStatus: "failed", canceledAt: later(1) };
  }
}

const fmt = (n) => n.toLocaleString("en-US");

async function ensureCustomers() {
  const customers = await UserMd.find({ role: "customer" }).limit(10);
  if (customers.length >= 3) return customers;

  for (let i = 1; i <= 3; i += 1) {
    const phone = `099100000${i}0`;
    if (!(await UserMd.exists({ phone }))) {
      await UserMd.create({ name: `مشتری دمو ${i}`, phone, password: "demo1234" });
    }
  }
  return UserMd.find({ role: "customer" }).limit(10);
}

async function run() {
  if (env.NODE_ENV === "production") {
    console.error("❌ اجرای این اسکریپت در production مجاز نیست");
    process.exit(1);
  }

  await connectDB();

  const [customers, products] = await Promise.all([ensureCustomers(), ProductMd.find({ isActive: true })]);
  const usable = products.filter((p) => p.variants.length > 0);
  if (usable.length === 0) {
    console.error("❌ محصولی وجود ندارد. اول `npm run seed` را اجرا کنید.");
    process.exit(1);
  }

  await OrderMd.deleteMany({ "address.receiverName": new RegExp(`^${DEMO_PREFIX}`) });

  const todayStart = startOfTehranDay();
  const generated = [];

  for (let i = 0; i < ORDER_COUNT; i += 1) {
    const createdAt =
      i < 6
        ? new Date(todayStart.getTime() + Math.random() * (Date.now() - todayStart.getTime()))
        : new Date(Date.now() - Math.random() * 89 * DAY);

    const key = pickStatus();
    const user = pick(customers);
    const place = pick(PLACES);
    const fields = stateFields(key, createdAt);
    const paid = fields.paymentStatus === "paid";

    const items = Array.from({ length: Math.ceil(Math.random() * 3) }, () => {
      const product = pick(usable);
      const variant = pick(product.variants);
      return {
        product: product._id,
        variantId: variant._id,
        name: product.name,
        image: product.images?.[0] || null,
        size: variant.size,
        color: variant.color,
        quantity: Math.ceil(Math.random() * 2),
        price: product.price,
        stockDeducted: paid,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const { zone, cost } = calculateShipping(place.city);

    const order = await OrderMd.create({
      user: user._id,
      items,
      address: {
        province: place.province,
        city: place.city,
        fullAddress: "آدرس نمونه برای تست آمار",
        postalCode: "1234567890",
        receiverName: `${DEMO_PREFIX} ${user.name}`,
        receiverPhone: user.phone,
      },
      totalAmount: subtotal + cost,
      discountAmount: 0,
      shippingCost: cost,
      shippingZone: zone,
      paymentAuthority: `DEMO-AUTH-${i}`,
      paymentRefId: paid ? `DEMO-REF-${i}` : null,
      stockDeducted: paid,
      ...fields,
    });

    // تاریخ ثبت دقیق (timestamps خاموش تا createdAt بازنویسی نشه)
    await OrderMd.updateOne({ _id: order._id }, { $set: { createdAt } }, { timestamps: false });

    generated.push({ key, createdAt, paidAt: fields.paidAt || null, amount: subtotal + cost, province: place.province });
  }

  console.log(`\n✅ ${ORDER_COUNT} سفارش دمو ساخته شد\n`);

  const windowStart = (days) => addDays(todayStart, -(days - 1));
  const counted = ["processing", "shipped", "delivered"];

  console.log("== درآمد (processing + shipped + delivered) بر اساس زمان پرداخت ==");
  for (const days of [7, 30, 90]) {
    const rows = generated.filter((o) => counted.includes(o.key) && o.paidAt >= windowStart(days));
    console.log(`${String(days).padStart(3)} روز: ${String(rows.length).padStart(3)} سفارش | ${fmt(rows.reduce((s, o) => s + o.amount, 0))} تومان`);
  }

  for (const days of [30, 90]) {
    console.log(`\n== تعداد سفارش به تفکیک وضعیت (زمان ثبت) - ${days} روز اخیر ==`);
    const rows = generated.filter((o) => o.createdAt >= windowStart(days));
    for (const { key } of STATUS_PLAN) {
      const list = rows.filter((o) => o.key === key);
      console.log(`${key.padEnd(16)} ${String(list.length).padStart(3)} | ${fmt(list.reduce((s, o) => s + o.amount, 0))} تومان`);
    }
    console.log(`${"جمع".padEnd(16)} ${String(rows.length).padStart(3)}`);
  }

  console.log("\nرمز مشتریان دمو (اگر ساخته شدند): demo1234");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ خطا:", err);
  process.exit(1);
});