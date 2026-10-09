import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import InfoPageLayout from "./InfoPageLayout";
import { STORE, SHIPPING, formatToman } from "../../constants/storeInfo";

function FaqItem({ question, open, onToggle, children }) {
  return (
    <div className="border-b border-ink/10">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-right"
      >
        <span className="font-body font-bold text-ink text-sm md:text-base">{question}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-ink/50" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5 font-body text-ink/70 text-sm leading-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
    {
      q: "هزینه و زمان ارسال چقدر است؟",
      a: (
        <>
          برای مشهد، هزینه ارسال {formatToman(SHIPPING.mashhad.cost)} و زمان تحویل {SHIPPING.mashhad.time} است. برای
          سایر شهرها، هزینه ارسال {formatToman(SHIPPING.other.cost)} و زمان تحویل {SHIPPING.other.time} است.{" "}
          <Link to="/shipping" className="text-blue hover:underline">
            جزئیات بیشتر
          </Link>
        </>
      ),
    },
    {
      q: "چطور سفارشم را پیگیری کنم؟",
      a: (
        <>
          بعد از ورود به حساب کاربری، در بخش{" "}
          <Link to="/profile?tab=orders" className="text-blue hover:underline">
            سفارش‌های من
          </Link>{" "}
          وضعیت همه سفارش‌های خود را می‌بینید.
        </>
      ),
    },
    {
      q: "پرداخت چگونه انجام می‌شود؟",
      a: "پرداخت به‌صورت آنلاین و از طریق درگاه امن زرین‌پال انجام می‌شود. اطلاعات کارت بانکی شما فقط در صفحه بانک وارد می‌شود و در این سایت ذخیره نمی‌شود.",
    },
    {
      q: "رمز عبورم را فراموش کرده‌ام، چه کنم؟",
      a: "در صفحه ورود روی «رمز عبور را فراموش کرده‌اید؟» بزنید و با کد تاییدی که به شماره موبایل شما ارسال می‌شود، رمز جدید انتخاب کنید.",
    },
    {
      q: "کد تخفیف را کجا وارد کنم؟",
      a: "در صفحه تکمیل خرید، بخش «کد تخفیف». پس از اعمال کد، مبلغ تخفیف در خلاصه سفارش نمایش داده می‌شود.",
    },
    {
      q: "چرا بعضی رنگ‌ها یا سایزها قابل انتخاب نیستند؟",
      a: "اگر یک رنگ یا سایز تمام شده باشد، در صفحه محصول غیرفعال نمایش داده می‌شود.",
    },
    {
      q: "چطور با پشتیبانی تماس بگیرم؟",
      a: (
        <>
          با شماره{" "}
          <a href={`tel:${STORE.phone}`} dir="ltr" className="text-blue hover:underline">
            {STORE.phoneDisplay}
          </a>{" "}
          در ساعت {STORE.hours} تماس بگیرید.
        </>
      ),
    },
  ];

  return (
    <InfoPageLayout title="سوالات متداول" subtitle="پاسخ رایج‌ترین سوالات را اینجا ببینید.">
      <div className="border-t border-ink/10">
        {items.map((item, i) => (
          <FaqItem
            key={item.q}
            question={item.q}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.a}
          </FaqItem>
        ))}
      </div>
    </InfoPageLayout>
  );
}

export default FaqPage;