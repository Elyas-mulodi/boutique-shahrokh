import { Link } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import InfoSection from "./InfoSection";
import { STORE } from "../../constants/storeInfo";

function TermsPage() {
  return (
    <InfoPageLayout title="شرایط و قوانین" subtitle={`قوانین استفاده از خدمات ${STORE.name}`}>
      <InfoSection title="۱. پذیرش قوانین">
        <p>با استفاده از این سایت و ثبت سفارش، شما شرایط و قوانین زیر را می‌پذیرید.</p>
      </InfoSection>

      <InfoSection title="۲. حساب کاربری">
        <p>
          برای ثبت سفارش باید با نام، شماره موبایل و رمز عبور ثبت‌نام کنید. حفظ رمز عبور و فعالیت‌های
          انجام‌شده با حساب کاربری بر عهده خود شماست.
        </p>
      </InfoSection>

      <InfoSection title="۳. قیمت و موجودی">
        <p>
          قیمت‌ها به تومان است و موجودی هر رنگ و سایز به‌صورت لحظه‌ای نمایش داده می‌شود. اگر تا
          زمان پرداخت، موجودی کالایی تمام شود، سفارش ثبت نخواهد شد.
        </p>
      </InfoSection>

      <InfoSection title="۴. ثبت سفارش و پرداخت">
        <p>
          پرداخت به‌صورت آنلاین از طریق درگاه زرین‌پال انجام می‌شود و سفارش پس از پرداخت موفق نهایی
          می‌شود. سفارش‌هایی که پرداخت آن‌ها تکمیل نشود لغو شده و پس از مدتی حذف می‌شوند.
        </p>
      </InfoSection>

      <InfoSection title="۵. ارسال">
        <p>
          هزینه و زمان ارسال بر اساس شهر مقصد است و در صفحه{" "}
          <Link to="/shipping" className="text-blue hover:underline">
            ارسال و هزینه‌ها
          </Link>{" "}
          آمده است. صحت آدرس و کد پستی واردشده بر عهده خریدار است.
        </p>
      </InfoSection>

      <InfoSection title="۶. تغییر قوانین">
        <p>{STORE.name} می‌تواند این قوانین را در هر زمان به‌روزرسانی کند. نسخه‌ی جاری همیشه در همین صفحه قابل مشاهده است.</p>
      </InfoSection>
    </InfoPageLayout>
  );
}

export default TermsPage;