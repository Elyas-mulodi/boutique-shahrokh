import { useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Switch from "../../components/ui/Switch";
import Spinner from "../../components/ui/Spinner";
import Thumb from "../../components/ui/Thumb";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { createCategory, updateCategory } from "../../services/categoryApi";
import { uploadCategoryImage } from "../../services/mediaApi";
import { getErrorMessage } from "../../utils/error";
import { getParentOptions } from "../../utils/categories";
import { slugify } from "../../utils/slug";

const SHOP_URL = import.meta.env.VITE_SHOP_URL || "http://localhost:5173";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const SLUG_RE = /^[^\s/?#%\\]+$/;

function validate(form, options) {
  const errors = {};

  const name = form.name.trim();
  if (name.length < 2) errors.name = "نام دسته‌بندی را وارد کنید (حداقل ۲ حرف)";
  else if (name.length > 60) errors.name = "نام دسته‌بندی بیش از حد طولانی است";

  const slug = form.slug.trim();
  if (slug.length < 2) errors.slug = "آدرس (slug) را وارد کنید";
  else if (slug.length > 80) errors.slug = "آدرس (slug) بیش از حد طولانی است";
  else if (!SLUG_RE.test(slug))
    errors.slug = "آدرس نباید فاصله یا کاراکترهای / ? # % داشته باشد";

  if (form.parent) {
    const option = options.find((o) => o.value === form.parent);
    if (!option) errors.parent = "دسته‌بندی والد پیدا نشد";
    else if (option.disabled)
      errors.parent = "این والد برای این دسته‌بندی مجاز نیست";
  }

  return errors;
}

function CategoryModal({ open, category, parentId, list, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(category);
  const fileInput = useRef(null);

  const [form, setForm] = useState(() => ({
    name: category?.name || "",
    slug: category?.slug || "",
    slugTouched: editing,
    parent: category ? String(category.parent || "") : parentId || "",
    image: category?.image || "",
    isActive: category ? category.isActive : true,
  }));
  const initialJson = useRef(JSON.stringify(form));

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [slugUnlocked, setSlugUnlocked] = useState(!editing);
  const [slugConflict, setSlugConflict] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const options = useMemo(
    () => getParentOptions(list, category?._id),
    [list, category],
  );
  const dirty = JSON.stringify(form) !== initialJson.current;
  const errors = useMemo(
    () => (submitted ? validate(form, options) : {}),
    [form, options, submitted],
  );
  const slugError =
    errors.slug ||
    (slugConflict && slugConflict.slug === form.slug
      ? slugConflict.message
      : null);

  const patch = (changes) => setForm((f) => ({ ...f, ...changes }));

  const handleName = (name) =>
    setForm((f) => ({
      ...f,
      name,
      slug: f.slugTouched ? f.slug : slugify(name),
    }));

  const requestClose = () => {
    if (saving || uploading) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type))
      return setImageError("فرمت تصویر مجاز نیست (jpg، png یا webp)");
    if (file.size > MAX_SIZE)
      return setImageError("حجم تصویر بیش از ۵ مگابایت است");

    setImageError(null);
    setUploading(true);
    try {
      const url = await uploadCategoryImage(file);
      patch({ image: url });
    } catch (err) {
      setImageError(getErrorMessage(err, "خطا در آپلود تصویر"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const found = validate(form, options);
    if (Object.keys(found).length > 0) {
      toast.error("لطفاً خطاهای فرم را اصلاح کنید");
      setTimeout(() => {
        const element = document.querySelector(
          '#category-form [aria-invalid="true"]',
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus?.({ preventScroll: true });
      }, 80);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        parent: form.parent || null,
        image: form.image || null,
        isActive: form.isActive,
      };

      const res = editing
        ? await updateCategory(category._id, payload)
        : await createCategory(payload);
      toast.success(res?.message || "ذخیره شد");
      onSaved();
    } catch (err) {
      const status = err?.response?.status;
      const message = getErrorMessage(err, "خطا در ذخیره دسته‌بندی");
      toast.error(message);

      if (status === 409) setSlugConflict({ slug: form.slug, message });
      if (status === 404 && editing) onSaved(); // دسته‌بندی همزمان حذف شده؛ لیست تازه میشه
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        dismissible={!saving && !uploading}
        closeOnBackdrop={false}
        size="md"
        title={editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={requestClose}
              disabled={saving || uploading}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              form="category-form"
              loading={saving}
              disabled={uploading || (editing && !dirty)}
            >
              {editing ? "ذخیره تغییرات" : "ساخت دسته‌بندی"}
            </Button>
          </>
        }
      >
        <form
          id="category-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <Input
            label="نام دسته‌بندی"
            value={form.name}
            onChange={(e) => handleName(e.target.value)}
            error={errors.name}
            maxLength={60}
            placeholder="مثلاً پیراهن زنانه"
            autoFocus
          />

          <div>
            <Input
              label="آدرس صفحه (slug)"
              value={form.slug}
              onChange={(e) =>
                patch({ slug: e.target.value.trim(), slugTouched: true })
              }
              error={slugError}
              dir="ltr"
              readOnly={!slugUnlocked}
              maxLength={80}
              className={!slugUnlocked ? "bg-ink/5 text-ink/60" : ""}
              hint={
                <span dir="ltr" className="break-all">
                  {SHOP_URL}/category/{form.slug || "..."}
                </span>
              }
            />
            {editing && !slugUnlocked && (
              <Button
                variant="ghost"
                size="sm"
                icon={Pencil}
                className="mt-1"
                onClick={() => setSlugUnlocked(true)}
              >
                ویرایش آدرس
              </Button>
            )}
            {editing && slugUnlocked && (
              <p className="mt-1.5 text-xs leading-6 text-amber-700">
                با تغییر آدرس، لینک قبلی این دسته‌بندی دیگر کار نمی‌کند.
              </p>
            )}
          </div>

          <Select
            label="دسته‌بندی والد"
            value={form.parent}
            onChange={(e) => patch({ parent: e.target.value })}
            error={errors.parent}
            hint="اگر والد انتخاب نکنید، این یک دسته‌بندی اصلی است."
          >
            <option value="">بدون والد (دسته‌بندی اصلی)</option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Select>

          <div>
            <p className="mb-1.5 text-sm text-ink/70">تصویر</p>

            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
                {form.image ? (
                  <Thumb
                    key={form.image}
                    src={form.image}
                    alt=""
                    className="h-full w-full rounded-none"
                  />
                ) : (
                  <ImagePlus size={24} className="text-ink/25" />
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Spinner size={22} className="text-blue" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ImagePlus}
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {form.image ? "تغییر تصویر" : "انتخاب تصویر"}
                </Button>
                {form.image && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    disabled={uploading}
                    onClick={() => patch({ image: "" })}
                  >
                    حذف
                  </Button>
                )}
              </div>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = ""; // امکان انتخاب دوباره‌ی همان فایل
                }}
              />
            </div>

            {imageError ? (
              <p className="mt-2 text-xs text-red-600">{imageError}</p>
            ) : (
              <p className="mt-2 text-xs leading-6 text-ink/40">
                تصویر تو منوی فروشگاه و بخش دسته‌بندی‌های صفحه اصلی نمایش داده
                می‌شود (jpg، png یا webp، حداکثر ۵ مگابایت).
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">نمایش در فروشگاه</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {form.isActive ? "فعال" : "غیرفعال"}
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onChange={(isActive) => patch({ isActive })}
                label="فعال بودن دسته‌بندی"
              />
            </div>

            {!form.isActive && (
              <p className="mt-3 text-xs leading-6 text-amber-700">
                دسته‌بندی غیرفعال از منو و صفحات فروشگاه برداشته می‌شود
                {editing && category.childrenCount > 0
                  ? "؛ زیردسته‌هایش هم دیگر نمایش داده نمی‌شوند"
                  : ""}
                . محصولاتش در لیست کل محصولات می‌مانند، مگر جداگانه غیرفعال
                شوند.
              </p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        tone="primary"
        title="خروج بدون ذخیره"
        message="تغییراتی که ذخیره نکرده‌اید از بین می‌رود. خارج می‌شوید؟"
        confirmLabel="خروج"
        cancelLabel="ماندن"
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
      />
    </>
  );
}

export default CategoryModal;
