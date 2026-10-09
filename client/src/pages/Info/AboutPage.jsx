import { Shirt, Truck, Headphones } from "lucide-react";
import InfoPageLayout from "./InfoPageLayout";
import InfoSection from "./InfoSection";
import { STORE } from "../../constants/storeInfo";

const values = [
  { icon: Shirt, title: "انتخاب با دقت", text: "لباس‌ها را با دقت انتخاب می‌کنیم تا خریدی مطمئن داشته باشید." },
  { icon: Truck, title: "ارسال به سراسر کشور", text: "سفارش شما به مشهد و همه شهرها ارسال می‌شود." },
  { icon: Headphones, title: "پشتیبانی تلفنی", text: "برای هر سوالی می‌توانید با ما تماس بگیرید." },
];

function AboutPage() {
  return (
    <InfoPageLayout title="درباره ما" subtitle={`با ${STORE.name} بیشتر آشنا شوید.`}>
      <InfoSection title={STORE.name}>
        <p>
          {STORE.name} یک فروشگاه پوشاک در مشهد است. هدف ما این است که پیدا کردن لباس مناسب، هم
          برای مشتریان حضوری و هم برای خریداران آنلاین، ساده و دلپذیر باشد.
        </p>
        <p>
          می‌توانید به فروشگاه ما در {STORE.address} سر بزنید، یا از همین سایت سفارش خود را ثبت کنید.
        </p>
      </InfoSection>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="border border-ink/10 rounded-2xl p-5 text-center">
            <div className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-3">
              <Icon size={19} className="text-ink/60" />
            </div>
            <h3 className="font-body font-bold text-ink text-sm">{title}</h3>
            <p className="font-body text-ink/60 text-xs leading-6 mt-2">{text}</p>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}

export default AboutPage;