import InfoPageLayout from "./InfoPageLayout";
import InfoSection from "./InfoSection";
import { STORE } from "../../constants/storeInfo";

function PrivacyPage() {
  return (
    <InfoPageLayout title="حریم خصوصی" subtitle={`نحوه نگهداری و استفاده از اطلاعات شما در ${STORE.name}`}>
      <InfoSection title="اطلاعاتی که دریافت می‌کنیم">
        <p>
          نام، شماره موبایل، رمز عبور و آدرس تحویل سفارش (شامل نام و شماره گیرنده و کد پستی) را
          برای ثبت‌نام و ارسال سفارش دریافت می‌کنیم.
        </p>
      </InfoSection>

      <InfoSection title="نحوه استفاده از اطلاعات">
        <p>
          این اطلاعات فقط برای ثبت و پیگیری سفارش، ارسال کد تایید به شماره موبایل شما و ارتباط
          درباره سفارش استفاده می‌شود.
        </p>
      </InfoSection>

      <InfoSection title="پرداخت">
        <p>
          پرداخت در درگاه بانکی زرین‌پال انجام می‌شود. اطلاعات کارت بانکی شما هرگز وارد این سایت
          نمی‌شود و ما به آن دسترسی نداریم.
        </p>
      </InfoSection>

      <InfoSection title="امنیت">
        <p>رمز عبور شما به‌صورت رمزنگاری‌شده ذخیره می‌شود و برای ما قابل مشاهده نیست.</p>
      </InfoSection>

      <InfoSection title="ذخیره‌سازی در مرورگر">
        <p>برای اینکه بعد از ورود، هر بار مجبور به وارد کردن مجدد اطلاعات نباشید، نشانه ورود شما در مرورگر ذخیره می‌شود و با خروج از حساب پاک می‌شود.</p>
      </InfoSection>

      <InfoSection title="اشتراک اطلاعات">
        <p>اطلاعات شما به اشخاص ثالث فروخته نمی‌شود و فقط در حد لازم برای پرداخت و ارسال سفارش استفاده می‌شود.</p>
      </InfoSection>
    </InfoPageLayout>
  );
}

export default PrivacyPage;