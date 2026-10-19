import { Copy } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import InfoRow from "../../components/ui/InfoRow";
import { useToast } from "../../components/toast/ToastContext";
import { copyText } from "../../utils/clipboard";

function OrderCustomerCard({ order }) {
  const toast = useToast();
  const { address, user } = order;

  const handleCopy = async () => {
    const text = [
      address.receiverName,
      address.receiverPhone,
      `${address.province}، ${address.city}`,
      address.fullAddress,
      `کد پستی: ${address.postalCode}`,
    ].join("\n");

    const ok = await copyText(text);

    if (ok) {
      toast.success("آدرس کپی شد");
    } else {
      toast.error("کپی انجام نشد");
    }
  };

  return (
    <Card>
      <h3 className="mb-2 font-heading font-bold text-ink">مشتری</h3>

      <dl className="divide-y divide-ink/5">
        <InfoRow label="نام">
          {user?._id ? (
            <Link
              to={`/users/${user._id}`}
              className="text-blue hover:underline"
            >
              {user.name}
            </Link>
          ) : (
            user?.name || "کاربر حذف‌شده"
          )}
        </InfoRow>

        <InfoRow label="موبایل">
          {user?.phone ? (
            <a
              href={`tel:${user.phone}`}
              dir="ltr"
              className="text-blue hover:underline"
            >
              {user.phone}
            </a>
          ) : (
            "—"
          )}
        </InfoRow>
      </dl>

      <div className="mb-2 mt-5 flex items-center justify-between gap-2">
        <h3 className="font-heading font-bold text-ink">آدرس تحویل</h3>

        <Button variant="ghost" size="sm" icon={Copy} onClick={handleCopy}>
          کپی
        </Button>
      </div>

      <dl className="divide-y divide-ink/5">
        <InfoRow label="گیرنده">{address.receiverName}</InfoRow>

        <InfoRow label="موبایل گیرنده">
          {address.receiverPhone ? (
            <a
              href={`tel:${address.receiverPhone}`}
              dir="ltr"
              className="text-blue hover:underline"
            >
              {address.receiverPhone}
            </a>
          ) : (
            "—"
          )}
        </InfoRow>

        <InfoRow label="استان / شهر">
          {address.province}، {address.city}
        </InfoRow>

        <InfoRow label="کد پستی">
          <span dir="ltr">{address.postalCode || "—"}</span>
        </InfoRow>
      </dl>

      <p className="mt-3 rounded-xl bg-ink/[0.03] p-3 text-sm leading-7 text-ink/80">
        {address.fullAddress || "آدرسی ثبت نشده است"}
      </p>
    </Card>
  );
}

export default OrderCustomerCard;
