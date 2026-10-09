import { Phone, MapPin, Clock, Navigation } from "lucide-react";
import InfoPageLayout from "./InfoPageLayout";
import { STORE, mapsUrl } from "../../constants/storeInfo";

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4 border border-ink/10 rounded-2xl p-5">
      <div className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center flex-shrink-0">
        <Icon size={19} className="text-ink/60" />
      </div>
      <div className="min-w-0">
        <h3 className="font-body font-bold text-ink text-sm">{title}</h3>
        <div className="font-body text-ink/70 text-sm leading-7 mt-1">{children}</div>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <InfoPageLayout
      title="تماس با ما"
      subtitle="برای راهنمایی، پیگیری سفارش یا هر سوالی با ما در ارتباط باشید."
    >
      <div className="space-y-4">
        <ContactCard icon={Phone} title="شماره تماس">
          <a
            href={`tel:${STORE.phone}`}
            dir="ltr"
            className="inline-block font-bold text-ink hover:text-blue transition-colors"
          >
            {STORE.phoneDisplay}
          </a>
        </ContactCard>

        <ContactCard icon={Clock} title="ساعت پاسخگویی">
          {STORE.hours}
        </ContactCard>

        <ContactCard icon={MapPin} title="آدرس فروشگاه">
          {STORE.address}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue mt-2 hover:underline"
          >
            <Navigation size={14} />
            مسیریابی روی نقشه
          </a>
        </ContactCard>
      </div>

      <a
        href={`tel:${STORE.phone}`}
        className="md:hidden flex items-center justify-center gap-2 bg-ink text-paper font-body font-bold py-3.5 rounded-full mt-6 hover:bg-blue transition-colors"
      >
        <Phone size={18} />
        تماس با پشتیبانی
      </a>
    </InfoPageLayout>
  );
}

export default ContactPage;