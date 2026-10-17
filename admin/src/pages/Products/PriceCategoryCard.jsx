import { useMemo } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import { flattenCategories } from "../../utils/categories";
import { digitsOnly } from "./productForm";
import { formatToman } from "../../utils/format";

function PriceCategoryCard({ state, errors, categoriesState, currentCategory, onPrice, onCategory }) {
  const options = useMemo(() => flattenCategories(categoriesState.data || []), [categoriesState.data]);

  // دسته‌ی فعلی محصول اگه تو لیست نبود (مثلاً حذف شده)
  const missingCurrent =
    state.category && categoriesState.data && !options.some((o) => String(o._id) === state.category) && currentCategory;

  const price = Number(state.price);

  return (
    <Card>
      <h3 className="mb-4 font-heading font-bold text-ink">قیمت و دسته‌بندی</h3>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="قیمت (تومان)"
          value={state.price}
          onChange={(e) => onPrice(digitsOnly(e.target.value))}
          error={errors.price}
          inputMode="numeric"
          dir="ltr"
          maxLength={11}
          placeholder="890000"
          hint={price > 0 ? formatToman(price) : "قیمت یکسان برای همه رنگ‌ها و سایزها"}
        />

        <div>
          {categoriesState.error && !categoriesState.data ? (
            <ErrorState message="خطا در دریافت دسته‌بندی‌ها" onRetry={categoriesState.reload} />
          ) : !categoriesState.data ? (
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : (
            <Select
              label="دسته‌بندی"
              value={state.category}
              onChange={(e) => onCategory(e.target.value)}
              error={errors.category}
            >
              <option value="">انتخاب کنید</option>
              {missingCurrent && <option value={state.category}>{currentCategory.name || "دسته‌بندی نامشخص"}</option>}
              {options.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>
    </Card>
  );
}

export default PriceCategoryCard;