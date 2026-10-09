import connectDB from "../Config/db.js";
import env from "../Config/env.js";
import UserMd from "../Modules/User/UserMd.js";
import CategoryMd from "../Modules/Category/CategoryMd.js";
import ProductMd from "../Modules/Product/ProductMd.js";
import mongoose from "mongoose";

import CartMd from "../Modules/Cart/CartMd.js";
import OrderMd from "../Modules/Order/OrderMd.js";

const COLOR_HEX = {
  مشکی: "#121212",
  سفید: "#FAFAFA",
  آبی: "#2D4FFF",
  طوسی: "#9CA3AF",
  صورتی: "#F4A6C0",
  قهوه‌ای: "#7B4B2A",
};

const withHex = (variants) => variants.map((v) => ({ ...v, colorHex: COLOR_HEX[v.color] || null }));
const sampleImage = (seed) => `https://picsum.photos/seed/${seed}/600/800`;

async function seed() {
  if (env.NODE_ENV === "production") {
    console.error("❌ اجرای seed در production مجاز نیست");
    process.exit(1);
  }
  await connectDB();

  console.log("🧹 پاک‌سازی داده‌های قبلی...");
  await Promise.all([
    UserMd.deleteMany({}),
    CategoryMd.deleteMany({}),
    ProductMd.deleteMany({}),
    CartMd.deleteMany({}),
    OrderMd.deleteMany({}),
  ]);
  // ---------- ادمین ----------
  console.log("👤 ساخت کاربر ادمین...");
  const admin = await UserMd.create({
    name: "ادمین بوتیک شاهرخ",
    phone: "09120000000",
    password: "admin123",
    role: "admin",
  });
  console.log(`   شماره: ${admin.phone} | رمز: admin123`);

  // ---------- دسته‌بندی‌ها (ریشه‌ای) ----------
  console.log("📂 ساخت دسته‌بندی‌ها...");
  const categoriesData = [
    { name: "زنانه", slug: "women", image: sampleImage("cat-women") },
    { name: "مردانه", slug: "men", image: sampleImage("cat-men") },
    { name: "بچگانه", slug: "kids", image: sampleImage("cat-kids") },
    { name: "اکسسوری", slug: "accessories", image: sampleImage("cat-accessories") },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await CategoryMd.create({ ...cat, parent: null });
    categories[cat.slug] = created;
  }

  // چند زیردسته نمونه برای زنانه و مردانه
  const womenSub = await CategoryMd.create({
    name: "پیراهن زنانه",
    slug: "women-dress",
    parent: categories.women._id,
  });
  const menSub = await CategoryMd.create({
    name: "پیراهن مردانه",
    slug: "men-shirt",
    parent: categories.men._id,
  });

  // ---------- محصولات ----------
  console.log("👕 ساخت محصولات نمونه...");
  const productsData = [
    {
      name: "پیراهن کتان زنانه",
      slug: "women-linen-dress",
      description: "پیراهن کتان سبک و خنک، مناسب فصل بهار و تابستان",
      price: 890000,
      category: womenSub._id,
      images: [sampleImage("wd1"), sampleImage("wd2")],
      variants: [
        { size: "S", color: "مشکی", stock: 10 },
        { size: "M", color: "مشکی", stock: 15 },
        { size: "L", color: "سفید", stock: 8 },
      ],
    },
    {
      name: "بلوز آستین‌بلند زنانه",
      slug: "women-blouse",
      description: "بلوز ساده و شیک برای استفاده روزمره",
      price: 450000,
      category: categories.women._id,
      images: [sampleImage("wb1"), sampleImage("wb2")],
      variants: [
        { size: "M", color: "آبی", stock: 12 },
        { size: "L", color: "آبی", stock: 6 },
      ],
    },
    {
      name: "پیراهن رسمی مردانه",
      slug: "men-formal-shirt",
      description: "پیراهن رسمی مناسب محیط کار و مهمانی",
      price: 750000,
      category: menSub._id,
      images: [sampleImage("ms1"), sampleImage("ms2")],
      variants: [
        { size: "M", color: "سفید", stock: 20 },
        { size: "L", color: "سفید", stock: 14 },
        { size: "XL", color: "مشکی", stock: 5 },
      ],
    },
    {
      name: "تیشرت بیسیک مردانه",
      slug: "men-basic-tshirt",
      description: "تیشرت نخی ساده، مناسب استفاده روزمره",
      price: 320000,
      category: categories.men._id,
      images: [sampleImage("mt1"), sampleImage("mt2")],
      variants: [
        { size: "M", color: "مشکی", stock: 25 },
        { size: "L", color: "طوسی", stock: 18 },
      ],
    },
    {
      name: "ست بچگانه دخترانه",
      slug: "kids-girl-set",
      description: "ست راحت و رنگارنگ مناسب بازی و مهدکودک",
      price: 380000,
      category: categories.kids._id,
      images: [sampleImage("kg1"), sampleImage("kg2")],
      variants: [
        { size: "4", color: "صورتی", stock: 10 },
        { size: "6", color: "صورتی", stock: 7 },
      ],
    },
    {
      name: "شلوار جین بچگانه پسرانه",
      slug: "kids-boy-jeans",
      description: "شلوار جین بادوام مناسب فعالیت‌های روزانه",
      price: 290000,
      category: categories.kids._id,
      images: [sampleImage("kb1"), sampleImage("kb2")],
      variants: [
        { size: "5", color: "آبی", stock: 9 },
        { size: "7", color: "آبی", stock: 11 },
      ],
    },
    {
      name: "کیف دستی چرم زنانه",
      slug: "women-leather-bag",
      description: "کیف دستی چرم طبیعی، طراحی مینیمال",
      price: 1250000,
      category: categories.accessories._id,
      images: [sampleImage("ac1"), sampleImage("ac2")],
      variants: [
        { size: "یک‌سایز", color: "قهوه‌ای", stock: 6 },
        { size: "یک‌سایز", color: "مشکی", stock: 4 },
      ],
    },
    {
      name: "کمربند چرم مردانه",
      slug: "men-leather-belt",
      description: "کمربند چرم طبیعی با قفل فلزی",
      price: 390000,
      category: categories.accessories._id,
      images: [sampleImage("ac3"), sampleImage("ac4")],
      variants: [
        { size: "یک‌سایز", color: "قهوه‌ای", stock: 14 },
        { size: "یک‌سایز", color: "مشکی", stock: 10 },
      ],
    },
  ];

  await ProductMd.insertMany(productsData.map((p) => ({ ...p, variants: withHex(p.variants) })));
  console.log(
    `✅ انجام شد: ${productsData.length} محصول، ${categoriesData.length + 2} دسته‌بندی، ۱ ادمین`
  );
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ خطا در seed:", err);
  process.exit(1);
});
