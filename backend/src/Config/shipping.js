export const SHIPPING_RATES = {
  mashhad: { cost: 100000, time: "۲ تا ۳ روز" },
  other: { cost: 150000, time: "حدود ۱۰ روز کاری" },
};

const normalize = (s = "") =>
  String(s)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]/g, "");

export function getShippingZone(city) {
  return normalize(city) === "مشهد" ? "mashhad" : "other";
}

export function calculateShipping(city) {
  const zone = getShippingZone(city);
  return { zone, ...SHIPPING_RATES[zone] };
}