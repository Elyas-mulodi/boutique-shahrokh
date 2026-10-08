import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { updateMe } from "../../services/userApi";
import { updateUser } from "../../redux/slices/authSlice";
import PasswordForm from "./PasswordForm";

function InfoTab({ me, onUpdated }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(me.name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const unchanged = name.trim() === me.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await updateMe({ name: name.trim() });
      const updated = res.data.data;
      onUpdated(updated);
      dispatch(updateUser({ name: updated.name }));
      setMessage({ type: "success", text: "اطلاعات ذخیره شد" });
    } catch (err) {
      const data = err?.response?.data;
      setMessage({
        type: "error",
        text: data?.errors?.[0]?.message || data?.message || "خطا در ذخیره اطلاعات",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">نام کامل</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
          />
        </div>

        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">شماره موبایل</label>
          <input
            value={me.phone}
            disabled
            dir="ltr"
            className="w-full border border-ink/10 rounded-xl px-4 py-3 font-body text-ink/50 bg-ink/5 cursor-not-allowed"
          />
          <p className="font-body text-xs text-ink/40 mt-1.5">شماره موبایل قابل تغییر نیست.</p>
        </div>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-body ${message.type === "success" ? "text-blue" : "text-red-500"}`}
          >
            {message.text}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={saving || unchanged}
          className="bg-ink text-paper font-body font-bold px-8 py-3 rounded-full hover:bg-blue transition-colors disabled:opacity-40"
        >
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>

      <div className="border-t border-ink/10 pt-8">
        <h3 className="font-heading font-bold text-ink mb-5">تغییر رمز عبور</h3>
        <PasswordForm />
      </div>
    </div>
  );
}

export default InfoTab;