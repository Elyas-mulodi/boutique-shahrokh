import { useMemo, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Switch from "../../components/ui/Switch";
import SegmentedControl from "../../components/ui/SegmentedControl";
import JalaliDateField from "../../components/ui/JalaliDateField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { createCoupon, updateCoupon } from "../../services/couponApi";
import { getErrorMessage } from "../../utils/error";
import { formatNumber, formatToman } from "../../utils/format";
import {
  addDaysToKey,
  endOfJalaliMonthKey,
  endOfJalaliYearKey,
  isoToKey,
  todayKey,
} from "../../utils/jalaliPicker";
import {
  SAMPLE_AMOUNT,
  buildInitialState,
  buildPayload,
  computeDiscount,
  digitsOnly,
  generateCode,
  sanitizeCode,
  validateCoupon,
} from "./couponForm";

const TYPE_OPTIONS = [
  { value: "percent", label: "درصدی" },
  { value: "fixed", label: "مبلغ ثابت" },
];

function MiniStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-ink/40">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function CouponModal({ open, coupon, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(coupon);
  const originalExpiryKey = coupon ? isoToKey(coupon.expiresAt) : null;
  const usedCount = coupon?.usedCount || 0;

  const [form, setForm] = useState(() => buildInitialState(coupon));
  const initialJson = useRef(JSON.stringify(form));

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [conflict, setConflict] = useState(null);

  const dirty = JSON.stringify(form) !== initialJson.current;
  const errors = useMemo(
    () =>
      submitted
        ? validateCoupon(form, { editing, usedCount, originalExpiryKey })
        : {},
    [form, submitted, editing, usedCount, originalExpiryKey],
  );
  const codeError =
    errors.code ||
    (conflict && conflict.code === form.code ? conflict.message : null);

  const presets = useMemo(() => {
    const today = todayKey();
    return [
      { label: "یک هفته", key: addDaysToKey(today, 7) },
      { label: "یک ماه", key: addDaysToKey(today, 30) },
      { label: "سه ماه", key: addDaysToKey(today, 90) },
      { label: "پایان این ماه", key: endOfJalaliMonthKey(today) },
      { label: "پایان امسال", key: endOfJalaliYearKey(today) },
    ];
  }, []);

  const patch = (changes) => setForm((f) => ({ ...f, ...changes }));

  // با عوض‌شدن نوع، مقدار و سقف پاک میشه تا «۲۰» (درصد) اشتباهی «۲۰ تومان» نشه
  const handleType = (type) => {
    if (type === form.type) return;
    patch({ type, value: "", maxDiscount: "" });
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const found = validateCoupon(form, {
      editing,
      usedCount,
      originalExpiryKey,
    });
    if (Object.keys(found).length > 0) {
      toast.error("لطفاً خطاهای فرم را اصلاح کنید");
      setTimeout(() => {
        const element = document.querySelector(
          '#coupon-form [aria-invalid="true"]',
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus?.({ preventScroll: true });
      }, 80);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(form, { editing, originalExpiryKey });
      const res = editing
        ? await updateCoupon(coupon._id, payload)
        : await createCoupon(payload);
      toast.success(res?.message || "ذخیره شد");
      onSaved();
    } catch (err) {
      const status = err?.response?.status;
      const message = getErrorMessage(err, "خطا در ذخیره کد تخفیف");
      toast.error(message);

      if (status === 409 && !editing) setConflict({ code: form.code, message });
      if (status === 404 && editing) onSaved(); // کد همزمان حذف شده؛ لیست تازه میشه
    } finally {
      setSaving(false);
    }
  };

  // مثال زنده از تخفیف
  const sample = Math.max(SAMPLE_AMOUNT, Number(form.minOrderAmount) || 0);
  const valueNumber = Number(form.value);
  const exampleValid =
    Number.isInteger(valueNumber) &&
    valueNumber >= 1 &&
    (form.type === "fixed" || valueNumber <= 100);
  const discount = exampleValid ? computeDiscount(form, sample) : null;

  const valueHint =
    form.type === "percent"
      ? "عددی بین ۱ تا ۱۰۰"
      : valueNumber > 0
        ? formatToman(valueNumber)
        : "مبلغ ثابت تخفیف به تومان";

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        dismissible={!saving}
        closeOnBackdrop={false}
        size="md"
        title={editing ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={requestClose}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              form="coupon-form"
              loading={saving}
              disabled={editing && !dirty}
            >
              {editing ? "ذخیره تغییرات" : "ساخت کد تخفیف"}
            </Button>
          </>
        }
      >
        <form
          id="coupon-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          {editing && (
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-ink/[0.03] p-4 text-center">
              <MiniStat
                label="سفارش پرداخت‌شده"
                value={formatNumber(coupon.stats?.paidOrders || 0)}
              />
              <MiniStat
                label="مجموع تخفیف"
                value={formatToman(coupon.stats?.discountTotal || 0)}
              />
              <MiniStat
                label="درآمد با این کد"
                value={formatToman(coupon.stats?.revenue || 0)}
              />
            </div>
          )}

          <div>
            <Input
              label="کد تخفیف"
              value={form.code}
              onChange={(e) => patch({ code: sanitizeCode(e.target.value) })}
              error={codeError}
              dir="ltr"
              readOnly={editing}
              maxLength={20}
              placeholder="مثلاً AUTUMN20"
              className={`font-mono tracking-wide ${editing ? "bg-ink/5 text-ink/60" : ""}`}
              hint={
                editing
                  ? "کد بعد از ساخت قابل تغییر نیست."
                  : "حروف انگلیسی، عدد، - و _ (۳ تا ۲۰ کاراکتر)"
              }
              autoFocus={!editing}
            />
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                icon={Shuffle}
                className="mt-1"
                onClick={() => patch({ code: generateCode() })}
              >
                ساخت کد تصادفی
              </Button>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-sm text-ink/70">نوع تخفیف</p>
            <SegmentedControl
              ariaLabel="نوع تخفیف"
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={handleType}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={
                form.type === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"
              }
              value={form.value}
              onChange={(e) => patch({ value: digitsOnly(e.target.value) })}
              error={errors.value}
              inputMode="numeric"
              dir="ltr"
              maxLength={form.type === "percent" ? 3 : 11}
              placeholder={form.type === "percent" ? "20" : "100000"}
              hint={valueHint}
            />

            {form.type === "percent" && (
              <Input
                label="سقف تخفیف (تومان، اختیاری)"
                value={form.maxDiscount}
                onChange={(e) =>
                  patch({ maxDiscount: digitsOnly(e.target.value) })
                }
                error={errors.maxDiscount}
                inputMode="numeric"
                dir="ltr"
                maxLength={11}
                placeholder="200000"
                hint={
                  Number(form.maxDiscount) > 0
                    ? formatToman(Number(form.maxDiscount))
                    : "خالی = بدون سقف"
                }
              />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="حداقل مبلغ سفارش (تومان، اختیاری)"
              value={form.minOrderAmount}
              onChange={(e) =>
                patch({ minOrderAmount: digitsOnly(e.target.value) })
              }
              error={errors.minOrderAmount}
              inputMode="numeric"
              dir="ltr"
              maxLength={11}
              placeholder="500000"
              hint={
                Number(form.minOrderAmount) > 0
                  ? formatToman(Number(form.minOrderAmount))
                  : "خالی = بدون حداقل (مبلغ کالاها، بدون هزینه ارسال)"
              }
            />

            <Input
              label="سقف تعداد استفاده (اختیاری)"
              value={form.usageLimit}
              onChange={(e) =>
                patch({ usageLimit: digitsOnly(e.target.value) })
              }
              error={errors.usageLimit}
              inputMode="numeric"
              dir="ltr"
              maxLength={8}
              placeholder="100"
              hint={
                editing
                  ? `تاکنون ${formatNumber(usedCount)} بار استفاده شده (شامل سفارش‌های در انتظار پرداخت)`
                  : "خالی = نامحدود"
              }
            />
          </div>

          <JalaliDateField
            label="تاریخ انقضا"
            value={form.expiryKey}
            onChange={(expiryKey) => patch({ expiryKey })}
            error={errors.expiry}
            presets={presets}
            hint={`${"تا پایان همین روز (ساعت ۲۳:۵۹) معتبر است"}`}
          />

          {discount !== null && (
            <div className="rounded-2xl border border-blue/20 bg-blue/5 p-4 text-sm leading-7 text-ink/80">
              <p className="mb-1 font-bold text-blue">مثال</p>
              برای سفارش {formatToman(sample)}، مشتری {formatToman(discount)}{" "}
              تخفیف می‌گیرد و {formatToman(sample - discount)} پرداخت می‌کند.
            </div>
          )}

          <div className="rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">فعال بودن کد</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {form.isActive ? "فعال" : "غیرفعال"}
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onChange={(isActive) => patch({ isActive })}
                label="فعال بودن کد تخفیف"
              />
            </div>
            {!form.isActive && (
              <p className="mt-3 text-xs leading-6 text-amber-700">
                کد غیرفعال تو فروشگاه پذیرفته نمی‌شود.
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

export default CouponModal;
