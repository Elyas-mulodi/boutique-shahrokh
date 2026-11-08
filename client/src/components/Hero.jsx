import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { EMPTY_BANNERS, fetchBanners } from "../redux/slices/bannerSlice";

// اگه هیچ بنری ساخته نشده باشه (یا سرور جواب نده)، همین هیرو قبلی نمایش داده میشه
const FALLBACK = {
  _id: "fallback",
  eyebrow: "کالکشن جدید",
  title: "بوتیک شاهرخ",
  subtitle: "جدیدترین کالکشن لباس، با کیفیت و سبک متفاوت",
  ctaText: "مشاهده محصولات",
  ctaLink: "/category/all",
  image: "/assets/hero.jpg",
  imageAlt: "بوتیک شاهرخ",
  focalPoint: { x: 50, y: 50 },
  textColor: "light",
  overlay: 30,
};

const SLIDE_INTERVAL = 7000;

// اگه برای عکس محصولات تابع آماده داری، همونو اینجا بذار
function imageSrc(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("/assets/")) return url;
  return `${import.meta.env.VITE_UPLOADS_URL || ""}${url.startsWith("/") ? "" : "/"}${url}`;
}

// لینک داخلی با Link، لینک https بیرونی با <a>
function CtaLink({ to, className, children }) {
  if (/^https?:\/\//i.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function HeroSlide({ banner }) {
  const light = banner.textColor !== "dark";
  const focal = banner.focalPoint || { x: 50, y: 50 };
  const hasCta = Boolean(banner.ctaText && banner.ctaLink);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0"
    >
      {banner.image && (
        <picture>
          {banner.imageMobile && <source media="(max-width: 767px)" srcSet={imageSrc(banner.imageMobile)} />}
          <motion.img
            src={imageSrc(banner.image)}
            alt={banner.imageAlt || banner.title}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      )}

      {/* تیرگی/روشنی قابل تنظیم از پنل + گرادینت پایین برای خوانایی متن */}
      <div
        className={`absolute inset-0 ${light ? "bg-ink" : "bg-paper"}`}
        style={{ opacity: (banner.overlay ?? 40) / 100 }}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${
          light ? "from-ink via-ink/30" : "from-paper via-paper/30"
        }`}
      />
      {light && <div className="absolute inset-0 bg-gradient-to-l from-blue/20 to-transparent" />}

      <div
        className={`relative z-10 h-full flex flex-col justify-end pb-20 px-6 md:px-16 ${
          light ? "text-paper" : "text-ink"
        }`}
      >
        {banner.eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-body opacity-70 text-xs md:text-sm mb-3"
          >
            {banner.eyebrow}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="font-heading text-4xl md:text-7xl font-bold leading-tight max-w-2xl"
        >
          {banner.title}
        </motion.h1>

        {banner.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body opacity-80 text-sm md:text-lg mt-4 max-w-md"
          >
            {banner.subtitle}
          </motion.p>
        )}

        {hasCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <CtaLink
              to={banner.ctaLink}
              className={`group inline-flex items-center gap-3 font-body font-bold px-8 py-3.5 rounded-full transition-colors duration-300 hover:bg-blue hover:text-paper ${
                light ? "bg-paper text-ink" : "bg-ink text-paper"
              }`}
            >
              {banner.ctaText}
              <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
            </CtaLink>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function Hero() {
  const dispatch = useDispatch();
  const reduce = useReducedMotion();
  const { items, status } = useSelector((state) => state.banners.byPlacement.hero ?? EMPTY_BANNERS);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    dispatch(fetchBanners("hero"));
  }, [dispatch]);

  const banners = items.length > 0 ? items : [FALLBACK];
  const count = banners.length;
  const current = banners[index % count];
  const light = current.textColor !== "dark";

  // اگه بیشتر از یک بنر فعال باشه، خودکار عوض میشن
  useEffect(() => {
    if (count < 2 || paused || reduce) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [index, count, paused, reduce]);

  // تا اولین پاسخ نیومده، فقط زمینه‌ی خالی (تا متن پیش‌فرض یهو عوض نشه)
  const loading = items.length === 0 && (status === "idle" || status === "loading");
  if (loading) {
    return <section aria-busy="true" className="relative w-full h-[90vh] overflow-hidden bg-ink" />;
  }

  return (
    <section
      className="relative w-full h-[90vh] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence>
        <HeroSlide key={current._id} banner={current} />
      </AnimatePresence>

      {count > 1 && (
        <div className="absolute bottom-6 left-6 md:left-16 z-20 flex items-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`نمایش بنر ${i + 1}`}
              aria-current={i === index % count}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index % count ? "w-6" : "w-2 opacity-50"
              } ${light ? "bg-paper" : "bg-ink"}`}
            />
          ))}
        </div>
      )}

      {/* نشانگر اسکرول پایین صفحه */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-6 right-1/2 translate-x-1/2 z-10 text-xs font-body ${
          light ? "text-paper/60" : "text-ink/60"
        }`}
      >
        ↓ اسکرول کنید
      </motion.div>
    </section>
  );
}

export default Hero;