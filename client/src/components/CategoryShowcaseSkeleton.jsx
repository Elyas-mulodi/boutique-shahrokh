function CategoryShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[160px]">
      <div className="col-span-2 row-span-2 rounded-2xl bg-ink/10 animate-pulse" />
      <div className="rounded-2xl bg-ink/10 animate-pulse" />
      <div className="rounded-2xl bg-ink/10 animate-pulse" />
      <div className="rounded-2xl bg-ink/10 animate-pulse" />
      <div className="rounded-2xl bg-ink/10 animate-pulse" />
    </div>
  );
}

export default CategoryShowcaseSkeleton;