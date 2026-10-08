import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthBanner from "./AuthBanner";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const isLogin = mode === "login";
  const showTabs = mode === "login" || mode === "register";

  return (
    <div className="flex min-h-screen">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        style={{ order: mode === "register" ? 2 : 1 }}
        className="w-full md:w-3/5 flex items-center justify-center px-6 md:px-16 py-12"
      >
        <div className="w-full max-w-sm">
          <Link to="/" className="font-heading text-ink text-xl block mb-8 text-center md:text-right">
            بوتیک شاهرخ
          </Link>

          {showTabs && (
            <div className="relative flex bg-ink/5 rounded-full p-1 mb-8">
              {["login", "register"].map((m) => (
                <button key={m} onClick={() => setMode(m)} className="relative flex-1 py-2.5 text-sm font-body z-10">
                  {mode === m && (
                    <motion.span
                      layoutId="authTab"
                      className="absolute inset-0 bg-ink rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={mode === m ? "text-paper" : "text-ink/60"}>
                    {m === "login" ? "ورود" : "ثبت‌نام"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "login" && <LoginForm key="login" onForgotPassword={() => setMode("forgot")} />}
            {mode === "register" && <RegisterForm key="register" />}
            {mode === "forgot" && <ForgotPasswordForm key="forgot" onBackToLogin={() => setMode("login")} />}
          </AnimatePresence>
        </div>
      </motion.div>

      <AuthBanner mode={isLogin ? "login" : "register"} onSwitch={setMode} />
    </div>
  );
}

export default AuthPage;