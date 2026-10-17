import { useState } from "react";
import { Pencil } from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { formatNumber } from "../../utils/format";

const SHOP_URL = import.meta.env.VITE_SHOP_URL || "http://localhost:5173";
const DESCRIPTION_MAX = 5000;

function BasicInfoCard({ state, errors, slugError, isEdit, onName, onSlug, onDescription }) {
  // تو ویرایش، آدرس قفله تا اشتباهی لینک‌های موجود خراب نشه
  const [slugUnlocked, setSlugUnlocked] = useState(!isEdit);

  return (
    <Card>
      <h3 className="mb-4 font-heading font-bold text-ink">اطلاعات اصلی</h3>

      <div className="space-y-5">
        <Input
          label="نام محصول"
          value={state.name}
          onChange={(e) => onName(e.target.value)}
          error={errors.name}
          maxLength={150}
          placeholder="مثلاً پیراهن کتان مردانه"
        />

        <div>
          <Input
            label="آدرس صفحه (slug)"
            value={state.slug}
            onChange={(e) => onSlug(e.target.value)}
            error={slugError}
            dir="ltr"
            readOnly={!slugUnlocked}
            maxLength={150}
            className={!slugUnlocked ? "bg-ink/5 text-ink/60" : ""}
            hint={
              <span dir="ltr" className="break-all">
                {SHOP_URL}/product/{state.slug || "..."}
              </span>
            }
          />

          {isEdit && !slugUnlocked && (
            <Button variant="ghost" size="sm" icon={Pencil} className="mt-1" onClick={() => setSlugUnlocked(true)}>
              ویرایش آدرس
            </Button>
          )}
          {isEdit && slugUnlocked && (
            <p className="mt-1.5 text-xs leading-6 text-amber-700">
              با تغییر آدرس، لینک قبلی این محصول دیگر کار نمی‌کند.
            </p>
          )}
        </div>

        <Textarea
          label="توضیحات"
          value={state.description}
          onChange={(e) => onDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          placeholder="جنس، اندازه‌ها، نکات شست‌وشو و ..."
          hint={`${formatNumber(state.description.length)} از ${formatNumber(DESCRIPTION_MAX)} کاراکتر`}
        />
      </div>
    </Card>
  );
}

export default BasicInfoCard;