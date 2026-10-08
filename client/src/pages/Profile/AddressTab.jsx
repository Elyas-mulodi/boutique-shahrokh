import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { saveAddress } from "../../services/userApi";
import AddressForm from "../Checkout/AddressForm";

const emptyAddress = {
  receiverName: "",
  receiverPhone: "",
  province: "",
  city: "",
  fullAddress: "",
  postalCode: "",
};

function AddressTab({ me, onUpdated }) {
  const [address, setAddress] = useState(me.defaultAddress || emptyAddress);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await saveAddress(address);
      onUpdated({ ...me, defaultAddress: res.data.data });
      setMessage({ type: "success", text: "آدرس ذخیره شد" });
    } catch (err) {
      const data = err?.response?.data;
      setMessage({
        type: "error",
        text: data?.errors?.[0]?.message || data?.message || "خطا در ذخیره آدرس",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      {!me.defaultAddress && (
        <div className="flex items-start gap-3 bg-ink/5 rounded-2xl p-4 mb-6">
          <MapPin size={18} className="text-ink/40 mt-0.5 flex-shrink-0" />
          <p className="font-body text-sm text-ink/60 leading-6">
            هنوز آدرسی ثبت نکرده‌اید. آدرس را اینجا وارد کنید یا با اولین خرید، خودکار ذخیره می‌شود.
          </p>
        </div>
      )}

      <AddressForm address={address} onChange={setAddress} />

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-body mt-4 ${message.type === "success" ? "text-blue" : "text-red-500"}`}
        >
          {message.text}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 bg-ink text-paper font-body font-bold px-8 py-3 rounded-full hover:bg-blue transition-colors disabled:opacity-40"
      >
        {saving ? "در حال ذخیره..." : "ذخیره آدرس"}
      </button>
    </form>
  );
}

export default AddressTab;