import { useState } from "react";
import { Ban, PackageCheck, Pencil, ShieldCheck, Truck, Wrench } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";
import { resolveStockIssue, updateOrderStatus } from "../../services/orderApi";
import { getErrorMessage } from "../../utils/error";
import { normalizeDigits } from "../../utils/text";
import { getOrderState, needsAttention } from "../../utils/orderState";

const TRACKING_MIN = 3;
const TRACKING_MAX = 60;

const IDLE_TEXT = {
  delivered: "این سفارش تحویل داده شده و اقدام دیگری ندارد.",
  canceled_paid: "این سفارش لغو شده است.",
  canceled_unpaid: "این سفارش پرداخت نشده و لغو یا منقضی شده است.",
  pending_payment: "منتظر پرداخت مشتری است؛ تا قبل از پرداخت، وضعیت قابل تغییر نیست.",
};

function OrderActions({ order, onChanged }) {
  const toast = useToast();
  const [dialog, setDialog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [trackingError, setTrackingError] = useState(null);

  const state = getOrderState(order);
  const paid = order.paymentStatus === "paid";

  const can = {
    ship: state === "processing",
    deliver: state === "shipped",
    tracking: paid && ["shipped", "delivered"].includes(order.status),
    repair: paid && order.status === "pending_payment",
    cancel: paid && ["processing", "shipped", "pending_payment"].includes(order.status),
    resolve: needsAttention(order),
  };
  const hasActions = Object.values(can).some(Boolean);

  const open = (name) => {
    setTrackingError(null);
    setTracking(name === "tracking" ? order.trackingCode || "" : "");
    setDialog(name);
  };

  const close = () => {
    if (!loading) setDialog(null);
  };

  const run = async (request) => {
    setLoading(true);
    try {
      const res = await request();
      toast.success(res?.message || "انجام شد");
      setDialog(null);
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
      // تغییر همزمان توسط ادمین دیگر: داده‌ی تازه گرفته میشه
      if (err?.response?.status === 409) {
        setDialog(null);
        await onChanged();
      }
    } finally {
      setLoading(false);
    }
  };

  const readTracking = (required) => {
    const value = normalizeDigits(tracking).trim();
    if (!value && !required) return { value: "" };
    if (value.length < TRACKING_MIN || value.length > TRACKING_MAX) {
      setTrackingError(`کد رهگیری باید بین ${TRACKING_MIN.toLocaleString("fa-IR")} تا ${TRACKING_MAX.toLocaleString("fa-IR")} کاراکتر باشد`);
      return null;
    }
    return { value };
  };

  const submitShip = (e) => {
    e.preventDefault();
    const result = readTracking(false);
    if (!result) return;
    run(() =>
      updateOrderStatus(order._id, {
        status: "shipped",
        ...(result.value && { trackingCode: result.value }),
      })
    );
  };

  const submitTracking = (e) => {
    e.preventDefault();
    const result = readTracking(true);
    if (!result) return;
    run(() => updateOrderStatus(order._id, { trackingCode: result.value }));
  };

  return (
    <Card>
      <h3 className="mb-3 font-heading font-bold text-ink">اقدامات</h3>

      {hasActions ? (
        <div className="flex flex-wrap gap-2">
          {can.ship && (
            <Button icon={Truck} onClick={() => open("ship")}>
              ثبت ارسال
            </Button>
          )}
          {can.deliver && (
            <Button icon={PackageCheck} onClick={() => open("deliver")}>
              ثبت تحویل
            </Button>
          )}
          {can.tracking && (
            <Button variant="secondary" icon={Pencil} onClick={() => open("tracking")}>
              {order.trackingCode ? "ویرایش کد رهگیری" : "ثبت کد رهگیری"}
            </Button>
          )}
          {can.repair && (
            <Button variant="secondary" icon={Wrench} onClick={() => open("repair")}>
              اصلاح وضعیت
            </Button>
          )}
          {can.resolve && (
            <Button variant="secondary" icon={ShieldCheck} onClick={() => open("resolve")}>
              مشکل موجودی رسیدگی شد
            </Button>
          )}
          {can.cancel && (
            <Button variant="danger" icon={Ban} onClick={() => open("cancel")}>
              لغو سفارش
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink/50">{IDLE_TEXT[state] || "اقدامی برای این سفارش وجود ندارد."}</p>
      )}

      {/* ثبت ارسال */}
      <Modal
        open={dialog === "ship"}
        onClose={close}
        dismissible={!loading}
        size="sm"
        title="ثبت ارسال سفارش"
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" form="ship-form" loading={loading}>
              ثبت ارسال
            </Button>
          </>
        }
      >
        <form id="ship-form" onSubmit={submitShip} noValidate>
          <Input
            label="کد رهگیری مرسوله (اختیاری)"
            value={tracking}
            onChange={(e) => {
              setTracking(e.target.value);
              setTrackingError(null);
            }}
            dir="ltr"
            maxLength={TRACKING_MAX}
            placeholder="مثلاً 2450123456789012345"
            error={trackingError}
            hint="اگر سفارش دستی تحویل می‌شود، می‌توانید خالی بگذارید."
            autoFocus
          />
        </form>
      </Modal>

      {/* ویرایش کد رهگیری */}
      <Modal
        open={dialog === "tracking"}
        onClose={close}
        dismissible={!loading}
        size="sm"
        title="کد رهگیری مرسوله"
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" form="tracking-form" loading={loading}>
              ذخیره
            </Button>
          </>
        }
      >
        <form id="tracking-form" onSubmit={submitTracking} noValidate>
          <Input
            label="کد رهگیری"
            value={tracking}
            onChange={(e) => {
              setTracking(e.target.value);
              setTrackingError(null);
            }}
            dir="ltr"
            maxLength={TRACKING_MAX}
            error={trackingError}
            autoFocus
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={dialog === "deliver"}
        onClose={close}
        loading={loading}
        tone="primary"
        title="ثبت تحویل"
        message="تحویل سفارش به مشتری ثبت شود؟ بعد از این فقط کد رهگیری قابل ویرایش است."
        confirmLabel="ثبت تحویل"
        onConfirm={() => run(() => updateOrderStatus(order._id, { status: "delivered" }))}
      />

      <ConfirmDialog
        open={dialog === "repair"}
        onClose={close}
        loading={loading}
        tone="primary"
        title="اصلاح وضعیت"
        message="وضعیت این سفارش ناسازگار است (پرداخت‌شده ولی «در انتظار پرداخت»). به «در حال پردازش» اصلاح شود؟"
        confirmLabel="اصلاح وضعیت"
        onConfirm={() => run(() => updateOrderStatus(order._id, { status: "processing" }))}
      />

      <ConfirmDialog
        open={dialog === "resolve"}
        onClose={close}
        loading={loading}
        tone="primary"
        title="رسیدگی به مشکل موجودی"
        message="تایید می‌کنید مشکل موجودی این سفارش بررسی و رسیدگی شده است؟ علامت «نیازمند بررسی» برداشته می‌شود."
        confirmLabel="تایید"
        onConfirm={() => run(() => resolveStockIssue(order._id))}
      />

      <ConfirmDialog
        open={dialog === "cancel"}
        onClose={close}
        loading={loading}
        title="لغو سفارش"
        message="این سفارش لغو شود؟ موجودی کالاها به انبار برمی‌گردد و این کار قابل بازگشت نیست. بازپرداخت وجه به مشتری باید جداگانه از پنل زرین‌پال انجام شود."
        confirmLabel="لغو سفارش"
        onConfirm={() => run(() => updateOrderStatus(order._id, { status: "canceled" }))}
      />
    </Card>
  );
}

export default OrderActions;