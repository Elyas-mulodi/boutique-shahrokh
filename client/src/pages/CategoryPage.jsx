import { useParams } from "react-router-dom";

function CategoryPage() {
  const { slug } = useParams();

  return (
    <div className="py-10">
      <h1 className="font-heading text-ink text-2xl">دسته‌بندی: {slug}</h1>
      <p className="font-body text-ink/60 mt-2">محصولات این دسته‌بندی به‌زودی نمایش داده می‌شوند</p>
    </div>
  );
}

export default CategoryPage;