function InfoSection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading text-ink font-bold text-lg mb-3">{title}</h2>
      <div className="font-body text-ink/70 text-sm leading-8 space-y-3">{children}</div>
    </section>
  );
}

export default InfoSection;