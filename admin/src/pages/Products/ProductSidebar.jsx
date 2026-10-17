import { ExternalLink, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Switch from "../../components/ui/Switch";
import Button from "../../components/ui/Button";
import InfoRow from "../../components/ui/InfoRow";
import { formatJalaliDateTime, formatNumber } from "../../utils/format";

const SHOP_URL = import.meta.env.VITE_SHOP_URL || "http://localhost:5173";

export function PublishCard({ isActive, onChange }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-ink">وضعیت نمایش</h3>
          <p className="mt-0.5 text-sm text-ink/60">{isActive ? "فعال" : "غیرفعال"}</p>
        </div>
        <Switch checked={isActive} onChange={onChange} label="فعال بودن محصول" />
      </div>
      <p className="mt-3 text-xs leading-6 text-ink/40">
        محصول غیرفعال در فروشگاه نمایش داده نمی‌شود و از سبد خرید مشتریان هم برداشته می‌شود.
      </p>
    </Card>
  );
}

export function MetaCard({ product, totalStock, variantsCount }) {
  return (
    <Card>
      <h3 className="mb-2 font-heading font-bold text-ink">اطلاعات</h3>
      <dl className="divide-y divide-ink/5">
        <InfoRow label="کد محصول">
          <span dir="ltr">{String(product._id).slice(-6).toUpperCase()}</span>
        </InfoRow>
        <InfoRow label="موجودی کل">{formatNumber(totalStock)} عدد</InfoRow>
        <InfoRow label="تعداد تنوع">{formatNumber(variantsCount)}</InfoRow>
        <InfoRow label="تاریخ ساخت">{formatJalaliDateTime(product.createdAt)}</InfoRow>
        <InfoRow label="آخرین تغییر">{formatJalaliDateTime(product.updatedAt)}</InfoRow>
      </dl>

      {product.isActive && (
        <a
          href={`${SHOP_URL}/product/${encodeURIComponent(product.slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:underline"
        >
          <ExternalLink size={15} />
          مشاهده در فروشگاه
        </a>
      )}
    </Card>
  );
}

export function DangerCard({ onDelete }) {
  return (
    <Card className="border-red-100">
      <h3 className="mb-1 font-heading font-bold text-ink">حذف محصول</h3>
      <p className="mb-3 text-xs leading-6 text-ink/50">
        حذف دائمی فقط برای محصولی ممکن است که در هیچ سفارش پرداخت‌شده‌ای نباشد. در غیر این صورت آن را غیرفعال کنید.
      </p>
      <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete}>
        حذف محصول
      </Button>
    </Card>
  );
}