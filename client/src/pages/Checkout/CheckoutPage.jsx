import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMe } from "../../services/userApi";
import { createOrder, getShippingQuote } from "../../services/orderApi";
import { fetchCart } from "../../redux/slices/cartSlice";
import ErrorState from "../../components/ErrorState";
import AddressForm from "./AddressForm";
import CouponInput from "./CouponInput";
import CheckoutSummary from "./CheckoutSummary";

const emptyAddress = {
  receiverName: "",
  receiverPhone: "",
  province: "",
  city: "",
  fullAddress: "",
  postalCode: "",
};

function CheckoutSkeleton() {
  return (
    <div className="py-8 md:py-10 animate-pulse">
      <div className="h-7 w-40 bg-ink/10 rounded mb-8" />
      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div className="h-80 rounded-2xl bg-ink/10" />
          <div className="h-32 rounded-2xl bg-ink/10" />
        </div>
        <div className="h-64 rounded-2xl bg-ink/10" />
      </div>
    </div>
  );
}

function CheckoutPage() {
  const dispatch = useDispatch();
  const { items, status: cartStatus } = useSelector((state) => state.cart);

  const [address, setAddress] = useState(emptyAddress);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [shipping, setShipping] = useState({ status: "idle", data: null });
  const [shippingRetry, setShippingRetry] = useState(0);
  const shippingRequest = useRef(0);

  useEffect(() => {
    dispatch(fetchCart());
    getMe()
      .then((res) => {
        const saved = res.data.data.defaultAddress;
        if (saved) {
          setDefaultAddress(saved);
          setUseDefaultAddress(true);
          setAddress(saved);
        }
      })
      .catch(() => {});
  }, [dispatch]);

  // با تغییر شهر، هزینه ارسال از بک‌اند پرسیده میشه (با تاخیر کوتاه تا با هر حرف درخواست نره)
  useEffect(() => {
    const city = address.city.trim();

    if (city.length < 2) {
      setShipping({ status: "idle", data: null });
      return;
    }

    setShipping({ status: "loading", data: null });
    const id = ++shippingRequest.current;

    const timer = setTimeout(async () => {
      try {
        const res = await getShippingQuote(city);
        if (id !== shippingRequest.current) return; // پاسخ کهنه
        setShipping({ status: "succeeded", data: res.data.data });
      } catch {
        if (id !== shippingRequest.current) return;
        setShipping({ status: "failed", data: null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [address.city, shippingRetry]);

  const handleToggleDefault = (checked) => {
    setUseDefaultAddress(checked);
    setAddress(checked && defaultAddress ? defaultAddress : emptyAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createOrder({ address, couponCode: coupon?.code });
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      const data = err?.response?.data;
      setSubmitError(
        data?.errors?.[0]?.message || data?.message || "خطا در ثبت سفارش",
      );
      setSubmitting(false);
    }
  };

  if (cartStatus === "loading" || cartStatus === "idle")
    return <CheckoutSkeleton />;

  if (cartStatus === "failed") {
    return (
      <div className="py-16">
        <ErrorState
          message="خطا در دریافت سبد خرید"
          onRetry={() => dispatch(fetchCart())}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-center gap-4">
        <p className="font-body text-ink/60">سبد خرید شما خالی است</p>
        <Link
          to="/products"
          className="bg-ink text-paper font-body font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-10">
      <h1 className="font-heading text-ink text-2xl font-bold mb-8">
        تکمیل خرید
      </h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-ink/5 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-ink mb-4">
              آدرس تحویل سفارش
            </h2>

            {defaultAddress && (
              <label className="flex items-center gap-2 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultAddress}
                  onChange={(e) => handleToggleDefault(e.target.checked)}
                  className="w-4 h-4 accent-blue"
                />
                <span className="font-body text-sm text-ink">
                  استفاده از آدرس قبلی
                </span>
              </label>
            )}

            <AddressForm address={address} onChange={setAddress} />
          </div>

          <div className="bg-ink/5 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-ink mb-4">کد تخفیف</h2>
            <CouponInput
              appliedCoupon={coupon}
              onApplied={setCoupon}
              onRemoved={() => setCoupon(null)}
            />
          </div>
        </div>

        <div>
          <div className="bg-ink/5 rounded-2xl p-6 sticky top-24">
            <h3 className="font-heading text-ink font-bold mb-4">
              خلاصه سفارش
            </h3>
            <CheckoutSummary
              items={items}
              discountAmount={coupon?.discountAmount || 0}
              shipping={shipping}
              onRetryShipping={() => setShippingRetry((n) => n + 1)}
            />

            {submitError && (
              <p className="text-sm font-body text-red-500 mt-4">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || shipping.status !== "succeeded"}
              className="w-full mt-6 bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors disabled:opacity-50"
            >
              {submitting ? "در حال انتقال به درگاه..." : "پرداخت و ثبت سفارش"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
