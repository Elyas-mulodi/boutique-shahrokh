function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="flex-shrink-0 text-ink/50">{label}</dt>
      <dd className="min-w-0 break-words text-left font-bold text-ink">{children}</dd>
    </div>
  );
}

export default InfoRow;