import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Send, Phone, MapPin, Clock } from "lucide-react";
import { STORE } from "../constants/storeInfo";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const guideLinks = [
  { label: "درباره ما", to: "/about" },
  { label: "تماس با ما", to: "/contact" },
  { label: "ارسال و هزینه‌ها", to: "/shipping" },
  { label: "سوالات متداول", to: "/faq" },
  { label: "شرایط و قوانین", to: "/terms" },
  { label: "حریم خصوصی", to: "/privacy" },
];
function InstagramIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function SocialLink({ href, label, children }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-paper/10 flex items-center justify-center hover:bg-blue transition-colors"
    >
      {children}
    </a>
  );
}

function Footer() {
  const categories = useSelector((state) => state.categories.items);
  const hasSocial = STORE.instagram || STORE.telegram;

  return (
    <footer className="bg-ink text-paper mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* درباره */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="col-span-2 md:col-span-1"
        >
          <h4 className="font-heading text-lg font-bold mb-3">{STORE.name}</h4>
          <p className="font-body text-paper/60 text-sm leading-6">
            فروشگاه پوشاک با کیفیت و طراحی متفاوت، برای سبکی که مال خودته.
          </p>

          {hasSocial && (
            <div className="flex items-center gap-3 mt-4">
              <SocialLink href={STORE.instagram} label="اینستاگرام">
                <InstagramIcon size={16} />{" "}
              </SocialLink>
              <SocialLink href={STORE.telegram} label="تلگرام">
                <Send size={16} />
              </SocialLink>
            </div>
          )}
        </motion.div>

        {/* دسته‌بندی‌ها */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
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
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4 className="font-heading text-sm font-bold mb-3">راهنما</h4>
          <ul className="space-y-2">
            {guideLinks.map((item) => (
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
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="col-span-2 md:col-span-1"
        >
          <h4 className="font-heading text-sm font-bold mb-3">ارتباط با ما</h4>
          <ul className="space-y-3">
            <li>
              <a
                href={`tel:${STORE.phone}`}
                className="flex items-center gap-2 text-paper/60 text-sm font-body hover:text-paper transition-colors"
              >
                <Phone size={15} />
                <span dir="ltr">{STORE.phoneDisplay}</span>
              </a>
            </li>
            <li className="flex items-center gap-2 text-paper/60 text-sm font-body">
              <Clock size={15} className="flex-shrink-0" />
              <span>{STORE.hours}</span>
            </li>
            <li className="flex items-start gap-2 text-paper/60 text-sm font-body">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" />
              <span className="leading-6">{STORE.address}</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* نوار پایینی */}
      <div
        className="border-t border-paper/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-paper/40 text-xs">
            © {new Date().getFullYear()} {STORE.name}. تمامی حقوق محفوظ است.
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
