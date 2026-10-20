import { Copy } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../components/toast/ToastContext";
import { copyText } from "../../utils/clipboard";
import {
  formatJalaliDate,
  formatNumber,
  formatToman,
} from "../../utils/format";
import { STATUS_META, getExpiryInfo } from "./couponForm";

export function CouponStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.active;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function CodeChip({ code }) {
  const toast = useToast();

  const handleCopy = async (e) => {
    e.stopPropagation();
    const ok = await copyText(code);
    if (ok) toast.success("کد کپی شد");
    else toast.error("کپی انجام نشد");
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        dir="ltr"
        className="rounded-lg bg-ink/5 px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-ink"
      >
        {code}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="کپی کد"
        title="کپی کد"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/30 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Copy size={15} />
      </button>
    </div>
  );
}

export function DiscountText({ coupon }) {
  if (coupon.type === "fixed")
    return <p className="font-bold">{formatToman(coupon.value)}</p>;

  return (
    <div>
      <p className="font-bold">{formatNumber(coupon.value)}٪</p>
      <p className="text-xs text-ink/40">
        {coupon.maxDiscount
          ? `حداکثر ${formatToman(coupon.maxDiscount)}`
          : "بدون سقف"}
      </p>
    </div>
  );
}

export function MinOrderText({ coupon }) {
  return coupon.minOrderAmount > 0 ? (
    <span>{formatToman(coupon.minOrderAmount)}</span>
  ) : (
    <span className="text-ink/30">ندارد</span>
  );
}

export function UsageCell({ coupon }) {
  const limit = coupon.usageLimit;
  const hasLimit = limit !== null && limit !== undefined;
  const percent = hasLimit
    ? Math.min(100, (coupon.usedCount / limit) * 100)
    : 0;
  const barColor =
    percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-amber-500" : "bg-blue";

  return (
    <div className="min-w-28">
      <p className="text-sm font-bold">
        {formatNumber(coupon.usedCount)}
        <span className="font-normal text-ink/40">
          {" "}
          / {hasLimit ? formatNumber(limit) : "نامحدود"}
        </span>
      </p>
      {hasLimit && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ExpiryCell({ coupon }) {
  const info = getExpiryInfo(coupon.expiresAt);
  return (
    <div>
      <p className="text-sm">{formatJalaliDate(coupon.expiresAt)}</p>
      <p className={`text-xs ${info.tone}`}>{info.text}</p>
    </div>
  );
}
