import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser } from "../../redux/slices/authSlice";
import { useLocation } from "react-router-dom";

function LoginForm({ onForgotPassword }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ phone: "", password: "" });
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? from.pathname + from.search : "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) navigate("/");
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="block font-body text-sm text-ink/70 mb-1.5">
          شماره موبایل
        </label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="09xxxxxxxxx"
          className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block font-body text-sm text-ink/70 mb-1.5">
          رمز عبور
        </label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
        />
      </div>

      {error && <p className="text-sm font-body text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-ink text-paper font-body font-bold py-3.5 rounded-full hover:bg-blue transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "در حال ورود..." : "ورود"}
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full text-center text-sm font-body text-ink/50 hover:text-blue transition-colors"
      >
        رمز عبور را فراموش کرده‌اید؟
      </button>
    </motion.form>
  );
}

export default LoginForm;
