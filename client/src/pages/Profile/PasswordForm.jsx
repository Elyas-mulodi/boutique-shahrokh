import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/userApi";

function PasswordField({ label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block font-body text-sm text-ink/70 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full border border-ink/15 rounded-xl pr-4 pl-11 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "پنهان‌کردن رمز" : "نمایش رمز"}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p className="font-body text-xs text-ink/40 mt-1.5">{hint}</p>}
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const canSubmit = form.current && form.next.length >= 6 && form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.next !== form.confirm) {
      setMessage({ type: "error", text: "تکرار رمز عبور جدید یکسان نیست" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm({ current: "", next: "", confirm: "" });
      setMessage({ type: "success", text: "رمز عبور با موفقیت تغییر کرد" });
    } catch (err) {
      const data = err?.response?.data;
      setMessage({
        type: "error",
        text: data?.errors?.[0]?.message || data?.message || "خطا در تغییر رمز عبور",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordField
        label="رمز عبور فعلی"
        value={form.current}
        onChange={set("current")}
        autoComplete="current-password"
      />
      <PasswordField
        label="رمز عبور جدید"
        value={form.next}
        onChange={set("next")}
        autoComplete="new-password"
        hint="حداقل ۶ کاراکتر"
      />
      <PasswordField
        label="تکرار رمز عبور جدید"
        value={form.confirm}
        onChange={set("confirm")}
        autoComplete="new-password"
      />

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
        disabled={saving || !canSubmit}
        className="bg-ink text-paper font-body font-bold px-8 py-3 rounded-full hover:bg-blue transition-colors disabled:opacity-40"
      >
        {saving ? "در حال ذخیره..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}

export default PasswordForm;