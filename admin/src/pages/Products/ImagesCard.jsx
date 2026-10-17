import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Thumb from "../../components/ui/Thumb";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/toast/ToastContext";
import { uploadProductImages } from "../../services/mediaApi";
import { getErrorMessage } from "../../utils/error";
import { formatNumber } from "../../utils/format";
import { MAX_IMAGES } from "./productForm";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const iconButton =
  "flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-ink shadow-sm transition-colors hover:bg-white disabled:opacity-30 disabled:hover:bg-white/90";

function ImagesCard({ images, onAdd, onRemove, onMove, onBusyChange }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    onBusyChange?.(uploading > 0);
  }, [uploading, onBusyChange]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const problems = [];
    const accepted = [];
    const room = MAX_IMAGES - images.length - uploading;

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) problems.push(`«${file.name}»: فرمت مجاز نیست`);
      else if (file.size > MAX_SIZE) problems.push(`«${file.name}»: حجم بیش از ۵ مگابایت است`);
      else if (accepted.length >= room) problems.push(`«${file.name}»: سقف ${formatNumber(MAX_IMAGES)} تصویر پر شده است`);
      else accepted.push(file);
    });

    setNotes(problems);
    if (accepted.length === 0) return;

    setUploading((n) => n + accepted.length);
    try {
      const urls = await uploadProductImages(accepted);
      onAdd(urls);
    } catch (err) {
      toast.error(getErrorMessage(err, "خطا در آپلود تصویر"));
    } finally {
      setUploading((n) => n - accepted.length);
    }
  };

  const full = images.length + uploading >= MAX_IMAGES;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-heading font-bold text-ink">تصاویر محصول</h3>
        <span className="text-xs text-ink/50">
          {formatNumber(images.length)} از {formatNumber(MAX_IMAGES)}
        </span>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!full) handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          full
            ? "cursor-not-allowed border-ink/10 bg-ink/[0.02] opacity-60"
            : dragging
            ? "border-blue bg-blue/5"
            : "border-ink/15 hover:border-blue/50 hover:bg-ink/[0.02]"
        }`}
      >
        <ImagePlus size={28} className="text-ink/30" />
        <p className="text-sm font-bold text-ink">تصاویر را اینجا رها کنید یا برای انتخاب کلیک کنید</p>
        <p className="text-xs text-ink/40">jpg، png یا webp • هر تصویر حداکثر ۵ مگابایت</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={full}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // امکان انتخاب دوباره‌ی همان فایل
          }}
        />
      </label>

      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-red-50 p-3 text-xs text-red-600">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      {(images.length > 0 || uploading > 0) && (
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, index) => (
            <li key={url} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
              <Thumb src={url} alt={`تصویر ${formatNumber(index + 1)}`} className="h-full w-full rounded-none" />

              {index < 2 && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-paper">
                  {index === 0 ? "اصلی" : "هاور"}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/60 to-transparent p-1.5 pt-6">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    aria-label="انتقال به قبل"
                    className={iconButton}
                  >
                    <ChevronRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="انتقال به بعد"
                    className={iconButton}
                  >
                    <ChevronLeft size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label="حذف تصویر"
                  className={`${iconButton} text-red-600`}
                >
                  <X size={15} />
                </button>
              </div>
            </li>
          ))}

          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`uploading-${i}`} className="aspect-[3/4]">
              <Skeleton className="h-full w-full rounded-xl" />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs leading-6 text-ink/40">
        تصویر اول، تصویر اصلی محصول است و تصویر دوم هنگام رفتن موس روی کارت محصول در فروشگاه نمایش داده می‌شود. با
        فلش‌ها ترتیب را تغییر دهید. تصاویر با «ذخیره» روی محصول اعمال می‌شوند.
      </p>
    </Card>
  );
}

export default ImagesCard;