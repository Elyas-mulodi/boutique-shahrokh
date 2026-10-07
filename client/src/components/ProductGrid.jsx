import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ErrorState from "./ErrorState";

function ProductGrid({ products, loading, error, onRetry, skeletonCount = 8 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="خطا در دریافت محصولات" onRetry={onRetry} />;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-ink/50 font-body py-12">محصولی یافت نشد</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;