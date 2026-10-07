import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const marqueeItems = Array(8).fill("تخفیف ویژه");

function getTimeLeft(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function PromoBanner() {
  const [targetDate] = useState(() => Date.now() + 5 * 24 * 60 * 60 * 1000); // ۵ روز دیگه
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "روز", value: timeLeft.days },
    { label: "ساعت", value: timeLeft.hours },
    { label: "دقیقه", value: timeLeft.minutes },
    { label: "ثانیه", value: timeLeft.seconds },
  ];

  return (
    <section className="py-10">
      <div className="relative rounded-2xl overflow-hidden bg-ink">
        {/* نوار مارکی مورب - بالای بنر، overlap به بیرون */}
        <div className="absolute -top-3 -right-10 -left-10 z-10 -rotate-2">
          <div className="bg-blue py-2 overflow-hidden whitespace-nowrap">
            <div className="flex w-max animate-[marquee_16s_linear_infinite]">
              {[...marqueeItems, ...marqueeItems].map((text, i) => (
                <span key={i} className="flex items-center font-body text-paper text-xs font-bold px-4">
                  {text}
                  <span className="mx-4 opacity-50">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* محتوای اصلی بنر */}
        <div className="relative pt-16 pb-10 px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-right">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-heading text-paper text-3xl md:text-4xl font-bold"
            >
              تا ۴۰٪ تخفیف پاییزه
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-body text-paper/70 text-sm md:text-base mt-2"
            >
              فقط برای مدت محدود، روی منتخبی از محصولات جدید
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/products"
                className="inline-block mt-6 bg-paper text-ink font-body font-bold px-7 py-3 rounded-full hover:bg-blue hover:text-paper transition-colors duration-300"
              >
                مشاهده تخفیف‌ها
              </Link>
            </motion.div>
          </div>

          {/* شمارش معکوس */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-2 md:gap-3"
          >
            {units.map((u) => (
              <div
                key={u.label}
                className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-paper/10 border border-paper/15"
              >
                <span className="font-heading text-paper text-xl md:text-2xl font-bold tabular-nums">
                  {String(u.value).padStart(2, "0")}
                </span>
                <span className="font-body text-paper/60 text-[10px] md:text-xs mt-0.5">{u.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PromoBanner;