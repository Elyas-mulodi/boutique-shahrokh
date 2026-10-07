import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductGrid from "./ProductGrid";

function ProductSection({ title, products, loading, error, onRetry, viewMoreLink }) {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-ink text-xl md:text-2xl font-bold">{title}</h2>
        {viewMoreLink && !error && (
          <Link
            to={viewMoreLink}
            className="flex items-center gap-1 text-blue text-sm font-body hover:gap-2 transition-all duration-200"
          >
            مشاهده بیشتر
            <ArrowLeft size={16} />
          </Link>
        )}
      </div>

      <ProductGrid products={products} loading={loading} error={error} onRetry={onRetry} />
    </section>
  );
}

export default ProductSection;