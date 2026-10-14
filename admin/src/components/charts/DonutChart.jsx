function DonutChart({ segments, centerValue, centerLabel, size = 176 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const arcs = [];
  let consumed = 0;
  segments.forEach((segment) => {
    if (segment.value <= 0 || total <= 0) return;
    const length = (segment.value / total) * circumference;
    arcs.push({ key: segment.key, color: segment.color, length, offset: consumed });
    consumed += length;
  });

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="نمودار دایره‌ای">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="14" className="text-ink/5" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-bold text-ink">{centerValue}</span>
        <span className="text-xs text-ink/40">{centerLabel}</span>
      </div>
    </div>
  );
}

export default DonutChart;