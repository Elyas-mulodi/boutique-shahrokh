function CartSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-5 border-b border-ink/10">
          <div className="w-20 h-24 rounded-xl bg-ink/10" />
          <div className="flex-1 space-y-3">
            <div className="h-3.5 bg-ink/10 rounded w-2/3" />
            <div className="h-3 bg-ink/10 rounded w-1/3" />
            <div className="h-7 bg-ink/10 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CartSkeleton;