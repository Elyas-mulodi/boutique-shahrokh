function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-paper shadow-sm animate-pulse">
      <div className="aspect-[3/4] bg-ink/10" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-ink/10 rounded w-3/4" />
        <div className="h-4 bg-ink/10 rounded w-1/2" />
        <div className="flex gap-1.5 mt-2">
          <div className="w-3.5 h-3.5 rounded-full bg-ink/10" />
          <div className="w-3.5 h-3.5 rounded-full bg-ink/10" />
          <div className="w-3.5 h-3.5 rounded-full bg-ink/10" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;