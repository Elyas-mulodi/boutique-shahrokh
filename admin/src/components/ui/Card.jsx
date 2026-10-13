function Card({ children, className = "", padding = "p-5" }) {
  return <div className={`rounded-2xl border border-ink/10 bg-white ${padding} ${className}`}>{children}</div>;
}

export default Card;