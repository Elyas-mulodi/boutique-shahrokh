import Spinner from "./Spinner";

const variants = {
  primary: "bg-ink text-paper hover:bg-blue",
  secondary: "border border-ink/15 bg-white text-ink hover:border-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-ink/70 hover:bg-ink/5",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={16} /> : Icon ? <Icon size={size === "sm" ? 15 : 17} /> : null}
      {children}
    </button>
  );
}

export default Button;