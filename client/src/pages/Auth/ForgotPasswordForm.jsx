import { useState } from "react";
import { motion } from "framer-motion";
import { forgotPasswordRequest, resetPasswordRequest } from "../../services/authApi";

function ForgotPasswordForm({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: شماره موبایل، 2: کد + رمز جدید
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordRequest({ phone });
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "خطا در ارسال کد تایید");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPasswordRequest({ phone, code, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "خطا در تغییر رمز عبور");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
        <p className="font-body text-ink">رمز عبور با موفقیت تغییر کرد.</p>
        <button
          onClick={onBackToLogin}
          className="w-full bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors"
        >
          ورود به حساب کاربری
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.3 }}
      onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
      className="space-y-5"
    >
      <button
        type="button"
        onClick={onBackToLogin}
        className="text-sm font-body text-ink/50 hover:text-ink transition-colors"
      >
        ← بازگشت به ورود
      </button>

      {step === 1 ? (
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">شماره موبایل</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
            dir="ltr"
          />
        </div>
      ) : (
        <>
          <p className="font-body text-sm text-ink/60">کد تایید به شماره {phone} ارسال شد.</p>
          <div>
            <label className="block font-body text-sm text-ink/70 mb-1.5">کد تایید</label>
            <input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors tracking-widest text-center"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block font-body text-sm text-ink/70 mb-1.5">رمز عبور جدید</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
            />
          </div>
        </>
      )}

      {error && <p className="text-sm font-body text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors disabled:opacity-50"
      >
        {loading ? "در حال ارسال..." : step === 1 ? "ارسال کد تایید" : "تغییر رمز عبور"}
      </button>
    </motion.form>
  );
}

export default ForgotPasswordForm;