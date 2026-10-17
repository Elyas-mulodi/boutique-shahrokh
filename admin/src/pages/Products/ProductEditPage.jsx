import { useParams } from "react-router-dom";
import BackLink from "../../components/ui/BackLink";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import { useAsync } from "../../hooks/useAsync";
import { getProduct } from "../../services/productApi";
import ProductForm from "./ProductForm.jsx";

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ProductEditPage() {
  const { id } = useParams();
  const state = useAsync(() => getProduct(id), [id]);
  const product = state.data && String(state.data._id) === id ? state.data : null;

  if (!product && state.error) {
    const notFound = state.errorStatus === 404 || state.errorStatus === 400;
    return (
      <>
        <BackLink to="/products">بازگشت به محصولات</BackLink>
        <Card>
          {notFound ? (
            <div className="py-10 text-center">
              <p className="font-heading font-bold text-ink">محصول پیدا نشد</p>
              <p className="mt-1 text-sm text-ink/50">ممکن است این محصول حذف شده باشد.</p>
            </div>
          ) : (
            <ErrorState message={state.error} onRetry={state.reload} />
          )}
        </Card>
      </>
    );
  }

  if (!product) return <FormSkeleton />;

  return <ProductForm key={String(product._id)} mode="edit" product={product} />;
}

export default ProductEditPage;