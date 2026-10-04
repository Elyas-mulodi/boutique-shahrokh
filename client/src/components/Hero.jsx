import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden bg-ink">
      <motion.img
        src="/assets/hero.jpg"
        alt="بوتیک شاهرخ"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* گرادینت به‌جای overlay یکدست */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-blue/20 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 md:px-16">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-body text-paper/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-3"
        >
          کالکشن جدید
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="font-heading text-paper text-4xl md:text-7xl font-bold leading-tight max-w-2xl"
        >
          بوتیک شاهرخ
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="font-body text-paper/80 text-sm md:text-lg mt-4 max-w-md"
        >
          جدیدترین کالکشن لباس، با کیفیت و سبک متفاوت
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Link
            to="/category/all"
            className="group inline-flex items-center gap-3 bg-paper text-ink font-body font-bold px-8 py-3.5 rounded-full hover:bg-blue hover:text-paper transition-colors duration-300"
          >
            مشاهده محصولات
            <motion.span
              className="inline-block"
              initial={false}
              animate={{ x: 0 }}
              whileHover={{ x: -4 }}
            >
              ←
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* نشانگر اسکرول پایین صفحه */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 right-1/2 translate-x-1/2 z-10 text-paper/60 text-xs font-body"
      >
        ↓ اسکرول کنید
      </motion.div>
    </section>
  );
}

export default Hero;