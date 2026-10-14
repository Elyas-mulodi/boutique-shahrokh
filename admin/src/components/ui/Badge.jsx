const tones = {
  neutral: "bg-ink/5 text-ink/70",
  blue: "bg-blue/10 text-blue",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  dark: "bg-ink text-paper",
  teal: "bg-cyan-50 text-cyan-700",
};

function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;