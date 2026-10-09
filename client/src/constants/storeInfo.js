export const STORE = {
  name: "بوتیک شاهرخ",
  phone: "09907228959", // برای لینک tel:
  phoneDisplay: "۰۹۹۰ ۷۲۲ ۸۹۵۹",
  address: "مشهد، قاسم‌آباد، پاساژ اکسیر، طبقه همکف، واحد ۲۰۸ و ۲۰۹",
  hours: "۱۰ صبح تا ۱۰ شب",
  instagram: "https://instagram.com/shahrokh.style", // مثال: "https://instagram.com/your_page"
  telegram: "", // مثال: "https://t.me/your_channel"
};

export const SHIPPING = {
  mashhad: { label: "مشهد", cost: 100000, time: "۲ تا ۳ روز" },
  other: { label: "سایر شهرها", cost: 150000, time: "حدود ۱۰ روز کاری" },
};

export const formatToman = (n) => `${n.toLocaleString("fa-IR")} تومان`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  STORE.address
)}`;