import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import BackLink from "../../components/ui/BackLink";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { useAsync } from "../../hooks/useAsync";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../services/productApi";
import { listAllCategories } from "../../services/categoryApi";
import { getErrorMessage } from "../../utils/error";
import { slugify } from "../../utils/slug";
import BasicInfoCard from "./BasicInfoCard";
import PriceCategoryCard from "./PriceCategoryCard";
import ImagesCard from "./ImagesCard";
import VariantsCard from "./VariantsCard";
import SaveBar from "./SaveBar";
import { DangerCard, MetaCard, PublishCard } from "./ProductSidebar";
import {
  MAX_IMAGES,
  buildInitialState,
  buildPayload,
  emptyErrors,
  hasErrors,
  newKey,
  norm,
  validateProduct,
} from "./productForm";

function focusFirstError() {
  const element = document.querySelector('[aria-invalid="true"]');
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.focus?.({ preventScroll: true });
}

export function ProductForm({ mode, product }) {
  const isEdit = mode === "edit";
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || "/products";

  const [state, setState] = useState(() => buildInitialState(product));
  const initialJson = useRef(JSON.stringify(state));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false); // آپلود تصویر در جریان است
  const [slugConflict, setSlugConflict] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoriesState = useAsync(() => listAllCategories(), []);

  const dirty = useMemo(
    () => JSON.stringify(state) !== initialJson.current,
    [state],
  );
  const errors = useMemo(
    () => (submitted ? validateProduct(state) : emptyErrors),
    [state, submitted],
  );
  const slugError =
    errors.slug ||
    (slugConflict && slugConflict.slug === state.slug
      ? slugConflict.message
      : null);

  // هشدار خروج/رفرش با تغییرات ذخیره‌نشده
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patch = (changes) => setState((s) => ({ ...s, ...changes }));

  const handleName = (name) =>
    setState((s) => ({
      ...s,
      name,
      slug: s.slugTouched ? s.slug : slugify(name),
    }));
  const handleSlug = (slug) => patch({ slug: slug.trim(), slugTouched: true });

  // ---- تصاویر ----
  const addImages = useCallback(
    (urls) =>
      setState((s) => ({
        ...s,
        images: [
          ...s.images,
          ...urls.filter((u) => !s.images.includes(u)),
        ].slice(0, MAX_IMAGES),
      })),
    [],
  );
  const removeImage = (index) =>
    setState((s) => ({ ...s, images: s.images.filter((_, i) => i !== index) }));
  const moveImage = (index, direction) =>
    setState((s) => {
      const target = index + direction;
      if (target < 0 || target >= s.images.length) return s;
      const images = [...s.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...s, images };
    });

  // ---- تنوع‌ها ----
  const updateGroup = (group, changes) =>
    setState((s) => ({
      ...s,
      variants: s.variants.map((v) =>
        v.group === group ? { ...v, ...changes } : v,
      ),
    }));

  const updateRow = (key, changes) =>
    setState((s) => ({
      ...s,
      variants: s.variants.map((v) =>
        v.key === key ? { ...v, ...changes } : v,
      ),
    }));

  const removeRow = (key) =>
    setState((s) => ({
      ...s,
      variants: s.variants.filter((v) => v.key !== key),
    }));
  const removeGroup = (group) =>
    setState((s) => ({
      ...s,
      variants: s.variants.filter((v) => v.group !== group),
    }));

  const addSize = (group) =>
    setState((s) => {
      const first = s.variants.find((v) => v.group === group);
      if (!first) return s;
      const row = {
        key: newKey(),
        group,
        color: first.color,
        colorHex: first.colorHex,
        size: "",
        stock: "0",
        originalStock: null,
      };
      return { ...s, variants: [...s.variants, row] };
    });

  const quickAdd = ({ color, colorHex, sizes, stock }) => {
    const colorKey = norm(color);
    const existingGroup = state.variants.find(
      (v) => norm(v.color) === colorKey,
    );
    const group = existingGroup ? existingGroup.group : newKey("g");
    const taken = new Set(
      state.variants.filter((v) => v.group === group).map((v) => norm(v.size)),
    );

    const fresh = [];
    let skipped = 0;
    sizes.forEach((size) => {
      if (taken.has(norm(size))) {
        skipped += 1;
        return;
      }
      taken.add(norm(size));
      fresh.push({
        key: newKey(),
        group,
        color: existingGroup ? existingGroup.color : color,
        colorHex: existingGroup ? existingGroup.colorHex || colorHex : colorHex,
        size,
        stock: String(stock),
        originalStock: null,
      });
    });

    if (fresh.length)
      setState((s) => ({ ...s, variants: [...s.variants, ...fresh] }));
    return { added: fresh.length, skipped };
  };

  // ---- ذخیره ----
  const handleSave = async () => {
    setSubmitted(true);

    const found = validateProduct(state);
    if (hasErrors(found)) {
      toast.error("لطفاً خطاهای فرم را اصلاح کنید");
      setTimeout(focusFirstError, 80);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(state);
      const res = isEdit
        ? await updateProduct(product._id, payload)
        : await createProduct(payload);
      toast.success(res?.message || "ذخیره شد");
      navigate(backTo, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = getErrorMessage(err, "خطا در ذخیره محصول");

      if (status === 409) setSlugConflict({ slug: state.slug, message });
      toast.error(message);

      if (status === 404 && isEdit) navigate(backTo, { replace: true });
      else if (status === 409) setTimeout(focusFirstError, 80);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (dirty) setConfirmCancel(true);
    else navigate(backTo);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteProduct(product._id);
      toast.success(res?.message || "محصول حذف شد");
      navigate(backTo, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در حذف محصول"));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const totalStock = state.variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );
  const canSave = !saving && !busy && (!isEdit || dirty);

  return (
    <>
      <BackLink to={backTo}>بازگشت به محصولات</BackLink>

      <PageHeader
        title={isEdit ? "ویرایش محصول" : "محصول جدید"}
        description={isEdit ? product.name : "اطلاعات محصول را وارد کنید"}
      />

      <div className="grid gap-6 pb-28 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BasicInfoCard
            state={state}
            errors={errors}
            slugError={slugError}
            isEdit={isEdit}
            onName={handleName}
            onSlug={handleSlug}
            onDescription={(description) => patch({ description })}
          />
          <PriceCategoryCard
            state={state}
            errors={errors}
            categoriesState={categoriesState}
            currentCategory={product?.category}
            onPrice={(price) => patch({ price })}
            onCategory={(category) => patch({ category })}
          />
          <ImagesCard
            images={state.images}
            onAdd={addImages}
            onRemove={removeImage}
            onMove={moveImage}
            onBusyChange={setBusy}
          />
          <VariantsCard
            variants={state.variants}
            errors={errors}
            onUpdateGroup={updateGroup}
            onUpdateRow={updateRow}
            onRemoveRow={removeRow}
            onRemoveGroup={removeGroup}
            onAddSize={addSize}
            onQuickAdd={quickAdd}
          />
        </div>

        <div className="space-y-6">
          <PublishCard
            isActive={state.isActive}
            onChange={(isActive) => patch({ isActive })}
          />
          {isEdit && (
            <MetaCard
              product={product}
              totalStock={totalStock}
              variantsCount={state.variants.length}
            />
          )}
          {isEdit && <DangerCard onDelete={() => setConfirmDelete(true)} />}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        busy={busy}
        canSave={canSave}
        onSave={handleSave}
        onCancel={handleCancel}
        saveLabel={isEdit ? "ذخیره تغییرات" : "ساخت محصول"}
      />

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        tone="primary"
        title="خروج بدون ذخیره"
        message="تغییراتی که ذخیره نکرده‌اید از بین می‌رود. خارج می‌شوید؟"
        confirmLabel="خروج"
        cancelLabel="ماندن"
        onConfirm={() => navigate(backTo)}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        loading={deleting}
        title="حذف محصول"
        message={`«${product?.name || ""}» برای همیشه حذف می‌شود (همراه با تصاویرش) و از سبد خرید مشتریان برداشته می‌شود. اگر در سفارش‌های پرداخت‌شده ثبت شده باشد، حذف انجام نمی‌شود و باید آن را غیرفعال کنید.`}
        confirmLabel="حذف محصول"
        onConfirm={handleDelete}
      />
    </>
  );
}

export default ProductForm;
