import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function PromoBanner({
  title = "ساده بپوش، خاص دیده شو",
  text = "هر قطعه با دقت انتخاب شده تا ست کردنش راحت باشه و تنت بشینه.",
  ctaText = "مشاهده کالکشن",
  ctaTo = "/products",
  monogram = "ش",
}) {
  return (
    <section className="py-10">
      <div className="relative overflow-hidden rounded-2xl bg-ink">
        {/* نور آبی ملایم پشت مونوگرام */}
        <div className="pointer-events-none absolute -left-24 -bottom-32 h-96 w-96 rounded-full bg-blue/30 blur-3xl" />

        {/* مونوگرام درشت، فقط خط دور */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-6 -bottom-28 md:-bottom-36 select-none font-heading font-bold leading-none text-transparent text-[18rem] md:text-[26rem]"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.22)" }}
        >
          {monogram}
        </span>

        {/* قاب باریک که موقع دیده شدن کشیده میشه */}
        <div className="pointer-events-none absolute inset-3 md:inset-4">
          <svg className="h-full w-full text-paper/30" fill="none" aria-hidden="true">
            <motion.rect
              x="1"
              y="1"
              rx="12"
              style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
              stroke="currentColor"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* متن */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="relative px-8 md:px-20 py-16 md:py-24 max-w-2xl"
        >
          <h2 className="font-heading text-paper text-4xl md:text-6xl font-bold leading-[1.35]">
            {title}
          </h2>
          <p className="font-body text-paper/70 text-sm md:text-base leading-8 mt-5 max-w-md">
            {text}
          </p>

          <Link to={ctaTo} className="group mt-9 inline-flex items-center gap-4 text-paper font-body font-bold">
            <span className="border-b border-paper/40 pb-1 group-hover:border-paper transition-colors duration-300">
              {ctaText}
            </span>
            <span className="h-px w-10 bg-paper/60 transition-all duration-300 group-hover:w-16 group-hover:bg-paper" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default PromoBanner;