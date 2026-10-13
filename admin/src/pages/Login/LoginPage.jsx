import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { clearError, loginAdmin } from "../../redux/slices/authSlice";
import { normalizeDigits } from "../../utils/text";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function LoginPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from;
  const redirectTo = from ? from.pathname + from.search : "/";

  if (token) return <Navigate to={redirectTo} replace />;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phone = normalizeDigits(form.phone).trim();
    const errors = {};
    if (!/^09\d{9}$/.test(phone)) errors.phone = "شماره موبایل معتبر نیست (مثال: 09123456789)";
    if (!form.password) errors.password = "رمز عبور را وارد کنید";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await dispatch(loginAdmin({ phone, password: form.password }));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ink/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-ink">بوتیک شاهرخ</h1>
          <p className="mt-1 text-sm text-ink/50">ورود به پنل مدیریت</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm"
        >
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              <AlertTriangle size={17} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="شماره موبایل"
            type="tel"
            inputMode="numeric"
            autoComplete="username"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            value={form.phone}
            onChange={handleChange("phone")}
            error={fieldErrors.phone}
          />

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm text-ink/70">
              رمز عبور
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange("password")}
                aria-invalid={Boolean(fieldErrors.password)}
                className={`h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-blue ${
                  fieldErrors.password ? "border-red-500" : "border-ink/15"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "پنهان‌کردن رمز" : "نمایش رمز"}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <Button type="submit" size="lg" loading={status === "loading"} className="w-full">
            ورود
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
