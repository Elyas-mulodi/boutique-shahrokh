function Spinner({ size = 18, className = "" }) {
  return (
    <span
      role="status"
      aria-label="در حال بارگذاری"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default Spinner;