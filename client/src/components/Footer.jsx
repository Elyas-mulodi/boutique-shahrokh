import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, MapPin, Send } from "lucide-react";
import { useSelector } from "react-redux";

const footerLinkVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function Footer() {
  const categories = useSelector((state) => state.categories.items);

  return (
    <footer className="bg-ink text-paper mt-16">
      {/* بخش خبرنامه */}
      <div className="border-t border-paper/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h3 className="font-heading text-lg md:text-xl font-bold">
              عضویت در خبرنامه
            </h3>
            <p className="font-body text-paper/60 text-sm mt-1">
              از جدیدترین کالکشن‌ها و تخفیف‌ها باخبر شو
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center w-full md:w-auto bg-paper/10 rounded-full p-1.5 max-w-sm"
          >
            <input
              type="email"
              placeholder="ایمیل شما..."
              className="flex-1 bg-transparent outline-none px-4 py-2 text-sm font-body text-paper placeholder:text-paper/40"
            />
            <button
              type="submit"
              className="bg-blue text-paper rounded-full w-9 h-9 flex items-center justify-center hover:brightness-110 transition"
              aria-label="عضویت"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* ستون‌های اصلی */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* درباره */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={footerLinkVariants}
          transition={{ duration: 0.4 }}
          className="col-span-2 md:col-span-1"
        >
          <h4 className="font-heading text-lg font-bold mb-3">بوتیک شاهرخ</h4>
          <p className="font-body text-paper/60 text-sm leading-6">
            فروشگاه آنلاین پوشاک با کیفیت و طراحی متفاوت، برای سبکی که مال
            خودته.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href="#"
              aria-label="اینستاگرام"
              className="w-9 h-9 rounded-full bg-paper/10 flex items-center justify-center hover:bg-blue transition-colors"
            >
              <Send size={16} />
            </a>
            <a
              href="#"
              aria-label="تلگرام"
              className="w-9 h-9 rounded-full bg-paper/10 flex items-center justify-center hover:bg-blue transition-colors"
            >
              <Send size={16} />
            </a>
            <a
              href="#"
              aria-label="واتساپ"
              className="w-9 h-9 rounded-full bg-paper/10 flex items-center justify-center hover:bg-blue transition-colors"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </motion.div>

        {/* دسته‌بندی‌ها */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={footerLinkVariants}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <h4 className="font-heading text-sm font-bold mb-3">دسته‌بندی‌ها</h4>
          <ul className="space-y-2">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat._id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="font-body text-paper/60 text-sm hover:text-paper transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* راهنما */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={footerLinkVariants}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4 className="font-heading text-sm font-bold mb-3">راهنما</h4>
          <ul className="space-y-2">
            {[
              { label: "درباره ما", to: "/about" },
              { label: "تماس با ما", to: "/contact" },
              { label: "سوالات متداول", to: "/faq" },
              { label: "شرایط و قوانین", to: "/terms" },
              { label: "حریم خصوصی", to: "/privacy" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="font-body text-paper/60 text-sm hover:text-paper transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* تماس */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={footerLinkVariants}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h4 className="font-heading text-sm font-bold mb-3">ارتباط با ما</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-paper/60 text-sm font-body">
              <Phone size={15} />
              <span dir="ltr">021-12345678</span>
            </li>
            <li className="flex items-center gap-2 text-paper/60 text-sm font-body">
              <Mail size={15} />
              <span dir="ltr">info@shahrokh-boutique.com</span>
            </li>
            <li className="flex items-start gap-2 text-paper/60 text-sm font-body">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" />
              <span>تهران، خیابان نمونه، پلاک ۰</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* نوار پایینی */}
      <div className="border-t border-paper/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-paper/40 text-xs">
            © {new Date().getFullYear()} بوتیک شاهرخ. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-3">
            <span className="font-body text-paper/40 text-xs">
              پرداخت امن با
            </span>
            <div className="bg-paper/10 rounded px-2.5 py-1 text-[11px] font-body text-paper/70">
              زرین‌پال
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
