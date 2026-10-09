import { Truck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import InfoSection from "./InfoSection";
import { SHIPPING, formatToman } from "../../constants/storeInfo";

function ShippingCard({ info, icon: Icon }) {
  return (
    <div className="border border-ink/10 rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center">
          <Icon size={19} className="text-ink/60" />
        </div>
        <h3 className="font-heading font-bold text-ink">{info.label}</h3>
      </div>

      <dl className="mt-5 space-y-3 font-body text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink/50">هزینه ارسال</dt>
          <dd className="font-bold text-ink">{formatToman(info.cost)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/50">زمان تحویل</dt>
          <dd className="font-bold text-ink">{info.time}</dd>
        </div>
      </dl>
    </div>
  );
}

function ShippingPage() {
  return (
    <InfoPageLayout
      title="ارسال و هزینه‌ها"
      subtitle="سفارش‌های ما به مشهد و سراسر کشور ارسال می‌شود."
    >
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <ShippingCard info={SHIPPING.mashhad} icon={MapPin} />
        <ShippingCard info={SHIPPING.other} icon={Truck} />
      </div>

      <InfoSection title="نکات مهم">
        <p>زمان‌های بالا تخمینی است و ممکن است بسته به شرایط شهر مقصد کمی تغییر کند.</p>
        <p>
          لطفاً هنگام ثبت سفارش، آدرس و کد پستی را کامل و دقیق وارد کنید تا ارسال بدون تأخیر انجام شود.
        </p>
        <p>
          برای پیگیری سفارش می‌توانید به بخش «سفارش‌های من» در{" "}
          <Link to="/profile?tab=orders" className="text-blue hover:underline">
            حساب کاربری
          </Link>{" "}
          مراجعه کنید یا با پشتیبانی تماس بگیرید.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}

export default ShippingPage;