import { useEffect, useState } from "react";
import { getProducts } from "../services/productApi";
import ProductGrid from "../components/ProductGrid";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ page: 1, limit: 20 })
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-10">
      <h1 className="font-heading text-ink text-2xl font-bold mb-6">همه محصولات</h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}

export default ProductListPage;