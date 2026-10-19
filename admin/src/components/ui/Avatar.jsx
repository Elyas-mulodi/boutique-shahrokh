const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-16 w-16 text-2xl",
};

function Avatar({ name, size = "md", muted = false }) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-heading font-bold ${
        muted ? "bg-ink/10 text-ink/40" : "bg-ink text-paper"
      } ${sizes[size]}`}
    >
      {name?.trim()?.[0] || "؟"}
    </span>
  );
}

export default Avatar;
