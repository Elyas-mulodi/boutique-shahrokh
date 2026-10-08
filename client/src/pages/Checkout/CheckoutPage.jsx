import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMe } from "../../services/userApi";
import { createOrder } from "../../services/orderApi";
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

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status: cartStatus } = useSelector((state) => state.cart);

  const [address, setAddress] = useState(emptyAddress);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const handleToggleDefault = (checked) => {
    setUseDefaultAddress(checked);
    setAddress(checked && defaultAddress ? defaultAddress : emptyAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createOrder({
        address,
        couponCode: coupon?.code,
      });
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "خطا در ثبت سفارش");
      setSubmitting(false);
    }
  };

  if (cartStatus === "loading" || cartStatus === "idle") {
    return <div className="py-20 text-center font-body text-ink/50">در حال بارگذاری...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-body text-ink/60 mb-4">سبد خرید شما خالی است</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-10">
      <h1 className="font-heading text-ink text-2xl font-bold mb-8">تکمیل خرید</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-ink/5 rounded-2xl p-6">
            <h2 className="font-heading font-bold text-ink mb-4">آدرس تحویل سفارش</h2>

            {defaultAddress && (
              <label className="flex items-center gap-2 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefaultAddress}
                  onChange={(e) => handleToggleDefault(e.target.checked)}
                  className="w-4 h-4 accent-blue"
                />
                <span className="font-body text-sm text-ink">استفاده از آدرس قبلی</span>
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
            <h3 className="font-heading text-ink font-bold mb-4">خلاصه سفارش</h3>
            <CheckoutSummary items={items} discountAmount={coupon?.discountAmount || 0} />

            {submitError && <p className="text-sm font-body text-red-500 mt-4">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting}
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