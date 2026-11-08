import { useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Switch from "../../components/ui/Switch";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { createBanner, updateBanner } from "../../services/bannerApi";
// ⚠️ فعلاً از همون آپلود دسته‌بندی استفاده میشه (فایل رو آپلود می‌کنه و آدرسش رو برمی‌گردونه)
import { uploadCategoryImage as uploadBannerImage } from "../../services/mediaApi";
import { getErrorMessage } from "../../utils/error";
import { PLACEMENT_OPTIONS, fromLocalInput, isValidLink, toImageSrc, toLocalInput } from "../../utils/banners";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const clamp = (n) => Math.min(100, Math.max(0, n));

function validate(form) {
  const errors = {};

  const title = form.title.trim();
  if (title.length < 2) errors.title = "تیتر بنر را وارد کنید (حداقل ۲ حرف)";
  else if (title.length > 120) errors.title = "تیتر بنر بیش از حد طولانی است";

  if (form.eyebrow.trim().length > 60) errors.eyebrow = "این متن بیش از حد طولانی است";
  if (form.subtitle.trim().length > 300) errors.subtitle = "توضیح بنر بیش از حد طولانی است";

  if (form.placement === "hero" && !form.image) errors.image = "برای بنر اصلی، تصویر الزامی است";

  const ctaText = form.ctaText.trim();
  const ctaLink = form.ctaLink.trim();
  if (ctaText.length > 40) errors.ctaText = "متن دکمه بیش از حد طولانی است";
  if (Boolean(ctaText) !== Boolean(ctaLink)) {
    if (!ctaText) errors.ctaText = "متن دکمه را هم وارد کنید";
    else errors.ctaLink = "لینک دکمه را هم وارد کنید";
  } else if (ctaLink && !isValidLink(ctaLink)) {
    errors.ctaLink = "لینک باید مسیر داخلی (مثل /products) یا آدرس کامل https باشد";
  }

  const order = Number(form.order);
  if (form.order === "" || !Number.isInteger(order) || order < 0 || order > 1000) {
    errors.order = "ترتیب باید عدد صحیح بین ۰ تا ۱۰۰۰ باشد";
  }

  const start = fromLocalInput(form.startsAt);
  const end = fromLocalInput(form.endsAt);
  if (form.startsAt && !start) errors.startsAt = "زمان شروع معتبر نیست";
  if (form.endsAt && !end) errors.endsAt = "زمان پایان معتبر نیست";
  if (start && end && new Date(end) <= new Date(start)) errors.endsAt = "زمان پایان باید بعد از زمان شروع باشد";

  return errors;
}

// آپلود یک تصویر با پیش‌نمایش کوچک
function ImageField({ label, value, onChange, onBusy, error, hint }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setLocalError("فرمت تصویر مجاز نیست (jpg، png یا webp)");
    if (file.size > MAX_SIZE) return setLocalError("حجم تصویر بیش از ۵ مگابایت است");

    setLocalError(null);
    setUploading(true);
    onBusy(true);
    try {
      onChange(await uploadBannerImage(file));
    } catch (err) {
      setLocalError(getErrorMessage(err, "خطا در آپلود تصویر"));
    } finally {
      setUploading(false);
      onBusy(false);
    }
  };

  const shownError = localError || error;

  return (
    <div>
      <p className="mb-1.5 text-sm text-ink/70">{label}</p>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
          {value ? (
            <img src={toImageSrc(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={22} className="text-ink/25" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Spinner size={22} className="text-blue" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={ImagePlus} disabled={uploading} onClick={() => inputRef.current?.click()}>
            {value ? "تغییر تصویر" : "انتخاب تصویر"}
          </Button>
          {value && (
            <Button variant="ghost" size="sm" icon={Trash2} disabled={uploading} onClick={() => onChange("")}>
              حذف
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = ""; // امکان انتخاب دوباره‌ی همان فایل
          }}
        />
      </div>

      {shownError ? (
        <p className="mt-2 text-xs text-red-600">{shownError}</p>
      ) : (
        hint && <p className="mt-2 text-xs leading-6 text-ink/40">{hint}</p>
      )}
    </div>
  );
}

// پیش‌نمایش بنر با همون تنظیمات (نقطه‌ی مهم، تیرگی، رنگ متن)
function PreviewCard({ src, x, y, overlay, textColor, eyebrow, title, subtitle, className }) {
  const light = textColor === "light";

  return (
    <div className={`relative overflow-hidden rounded-xl bg-ink/10 ${className}`}>
      {src && (
        <img
          src={toImageSrc(src)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${x}% ${y}%` }}
        />
      )}
      <div className={`absolute inset-0 ${light ? "bg-ink" : "bg-white"}`} style={{ opacity: overlay / 100 }} />
      <div className={`relative flex h-full flex-col justify-end gap-0.5 p-3 ${light ? "text-white" : "text-ink"}`}>
        {eyebrow && <span className="truncate text-[9px] opacity-70">{eyebrow}</span>}
        <span className="line-clamp-2 text-sm font-bold leading-tight">{title || "تیتر بنر"}</span>
        {subtitle && <span className="truncate text-[10px] opacity-80">{subtitle}</span>}
      </div>
    </div>
  );
}

function BannerModal({ open, banner, nextOrder = 0, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(banner);
  const pickerRef = useRef(null);

  const [form, setForm] = useState(() => ({
    placement: banner?.placement || "hero",
    eyebrow: banner?.eyebrow || "",
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    ctaText: banner?.ctaText || "",
    ctaLink: banner?.ctaLink || "",
    image: banner?.image || "",
    imageMobile: banner?.imageMobile || "",
    imageAlt: banner?.imageAlt || "",
    focalX: banner?.focalPoint?.x ?? 50,
    focalY: banner?.focalPoint?.y ?? 50,
    textColor: banner?.textColor || "light",
    overlay: banner?.overlay ?? 40,
    order: String(banner?.order ?? nextOrder),
    isActive: banner ? banner.isActive : true,
    startsAt: toLocalInput(banner?.startsAt),
    endsAt: toLocalInput(banner?.endsAt),
  }));
  const initialJson = useRef(JSON.stringify(form));

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);

  const uploading = uploads > 0;
  const dirty = JSON.stringify(form) !== initialJson.current;
  const errors = useMemo(() => (submitted ? validate(form) : {}), [form, submitted]);

  const patch = (changes) => setForm((f) => ({ ...f, ...changes }));
  const busy = (isBusy) => setUploads((n) => Math.max(0, n + (isBusy ? 1 : -1)));

  const requestClose = () => {
    if (saving || uploading) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  // نقطه‌ی مهم: درصد موقعیت کلیک روی خود عکس (بدون برش)
  const setFocal = (e) => {
    const rect = pickerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    patch({
      focalX: clamp(Math.round(((e.clientX - rect.left) / rect.width) * 100)),
      focalY: clamp(Math.round(((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      toast.error("لطفاً خطاهای فرم را اصلاح کنید");
      setTimeout(() => {
        const element = document.querySelector('#banner-form [aria-invalid="true"]');
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus?.({ preventScroll: true });
      }, 80);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        placement: form.placement,
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        image: form.image || null,
        imageMobile: form.imageMobile || null,
        imageAlt: form.imageAlt.trim(),
        focalPoint: { x: form.focalX, y: form.focalY },
        textColor: form.textColor,
        overlay: Number(form.overlay),
        order: Number(form.order),
        isActive: form.isActive,
        startsAt: fromLocalInput(form.startsAt),
        endsAt: fromLocalInput(form.endsAt),
      };

      const res = editing ? await updateBanner(banner._id, payload) : await createBanner(payload);
      toast.success(res?.message || "ذخیره شد");
      onSaved();
    } catch (err) {
      const status = err?.response?.status;
      toast.error(getErrorMessage(err, "خطا در ذخیره بنر"));
      if (status === 404 && editing) onSaved(); // بنر همزمان حذف شده؛ لیست تازه میشه
    } finally {
      setSaving(false);
    }
  };

  const previewProps = {
    x: form.focalX,
    y: form.focalY,
    overlay: Number(form.overlay),
    textColor: form.textColor,
    eyebrow: form.eyebrow,
    title: form.title,
    subtitle: form.subtitle,
  };

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        dismissible={!saving && !uploading}
        closeOnBackdrop={false}
        size="md"
        title={editing ? "ویرایش بنر" : "بنر جدید"}
        footer={
          <>
            <Button variant="secondary" onClick={requestClose} disabled={saving || uploading}>
              انصراف
            </Button>
            <Button type="submit" form="banner-form" loading={saving} disabled={uploading || (editing && !dirty)}>
              {editing ? "ذخیره تغییرات" : "ساخت بنر"}
            </Button>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit} noValidate className="space-y-5">
          <Select
            label="جایگاه بنر"
            value={form.placement}
            onChange={(e) => patch({ placement: e.target.value })}
            hint="بنر اصلی بالای صفحه‌ی اول است و تصویر الزامی دارد؛ بنر تبلیغاتی میان بخش‌های صفحه‌ی اول قرار می‌گیرد."
          >
            {PLACEMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Input
            label="تیتر"
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            error={errors.title}
            maxLength={120}
            placeholder="مثلاً کالکشن جدید رسید"
            autoFocus
          />

          <Input
            label="متن کوچک بالای تیتر (اختیاری)"
            value={form.eyebrow}
            onChange={(e) => patch({ eyebrow: e.target.value })}
            error={errors.eyebrow}
            maxLength={60}
          />

          <Input
            label="توضیح کوتاه (اختیاری)"
            value={form.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            error={errors.subtitle}
            maxLength={300}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="متن دکمه (اختیاری)"
              value={form.ctaText}
              onChange={(e) => patch({ ctaText: e.target.value })}
              error={errors.ctaText}
              maxLength={40}
              placeholder="مشاهده محصولات"
            />
            <Input
              label="لینک دکمه"
              value={form.ctaLink}
              onChange={(e) => patch({ ctaLink: e.target.value })}
              error={errors.ctaLink}
              dir="ltr"
              maxLength={300}
              placeholder="/category/all"
            />
          </div>

          <ImageField
            label={form.placement === "hero" ? "تصویر" : "تصویر (اختیاری)"}
            value={form.image}
            onChange={(image) => patch({ image })}
            onBusy={busy}
            error={errors.image}
            hint="jpg، png یا webp، حداکثر ۵ مگابایت. عکس افقی و باکیفیت بهتر نتیجه می‌دهد."
          />

          {form.image && (
            <>
              <div>
                <p className="mb-1.5 text-sm text-ink/70">نقطه‌ی مهم تصویر</p>
                <div
                  ref={pickerRef}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setFocal(e);
                  }}
                  onPointerMove={(e) => e.buttons && setFocal(e)}
                  className="relative cursor-crosshair touch-none overflow-hidden rounded-xl border border-ink/10"
                >
                  <img src={toImageSrc(form.image)} alt="" draggable={false} className="block w-full select-none" />
                  <span
                    className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ring-2 ring-blue"
                    style={{ left: `${form.focalX}%`, top: `${form.focalY}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-6 text-ink/40">
                  روی مهم‌ترین قسمت عکس (مثلاً صورت مدل) کلیک کنید تا هنگام برش در موبایل و دسکتاپ همیشه دیده شود.
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-sm text-ink/70">پیش‌نمایش</p>
                <div className="flex items-start gap-3">
                  <PreviewCard src={form.image} {...previewProps} className="aspect-video flex-1" />
                  <PreviewCard
                    src={form.imageMobile || form.image}
                    {...previewProps}
                    className="aspect-[9/16] w-24 flex-shrink-0"
                  />
                </div>
              </div>
            </>
          )}

          <ImageField
            label="تصویر موبایل (اختیاری)"
            value={form.imageMobile}
            onChange={(imageMobile) => patch({ imageMobile })}
            onBusy={busy}
            hint="اگر عکس جداگانه‌ی عمودی دارید اینجا بگذارید؛ وگرنه از همان تصویر اصلی استفاده می‌شود."
          />

          <Input
            label="متن جایگزین تصویر (اختیاری)"
            value={form.imageAlt}
            onChange={(e) => patch({ imageAlt: e.target.value })}
            maxLength={150}
            hint="برای سئو و کاربران نابینا؛ مثلاً «مدل با کت بلند کرم»."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="رنگ متن" value={form.textColor} onChange={(e) => patch({ textColor: e.target.value })}>
              <option value="light">سفید (برای عکس تیره)</option>
              <option value="dark">مشکی (برای عکس روشن)</option>
            </Select>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm text-ink/70" htmlFor="banner-overlay">
                <span>تیرگی روی عکس</span>
                <span dir="ltr" className="text-xs text-ink/50">
                  {form.overlay}%
                </span>
              </label>
              <input
                id="banner-overlay"
                type="range"
                min={0}
                max={80}
                step={5}
                value={form.overlay}
                onChange={(e) => patch({ overlay: Number(e.target.value) })}
                className="h-11 w-full accent-blue"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="شروع نمایش (اختیاری)"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => patch({ startsAt: e.target.value })}
              error={errors.startsAt}
              dir="ltr"
            />
            <Input
              label="پایان نمایش (اختیاری)"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => patch({ endsAt: e.target.value })}
              error={errors.endsAt}
              dir="ltr"
              hint="اگر خالی بگذارید بنر همیشه نمایش داده می‌شود."
            />
          </div>

          <Input
            label="ترتیب نمایش"
            type="number"
            min={0}
            max={1000}
            value={form.order}
            onChange={(e) => patch({ order: e.target.value })}
            error={errors.order}
            dir="ltr"
            hint="عدد کمتر یعنی زودتر. بعداً هم می‌توانید با فلش‌های لیست جابه‌جایش کنید."
          />

          <div className="rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">نمایش در سایت</p>
                <p className="mt-0.5 text-xs text-ink/50">{form.isActive ? "فعال" : "غیرفعال"}</p>
              </div>
              <Switch checked={form.isActive} onChange={(isActive) => patch({ isActive })} label="فعال بودن بنر" />
            </div>
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

export default BannerModal;