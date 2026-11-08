import { ChevronDown, ChevronUp, ImageOff, Pencil, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Switch from "../../components/ui/Switch";
import { PLACEMENT_LABELS, formatDate, getBannerStatus, toImageSrc } from "../../utils/banners";

const iconAction =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/40";

function BannerRow({ banner, active, toggling, position, moving, onToggle, onMove, onEdit, onDelete }) {
  const status = getBannerStatus({ ...banner, isActive: active });
  const focal = banner.focalPoint || { x: 50, y: 50 };
  const overlayColor = banner.textColor === "dark" ? "bg-white" : "bg-ink";

  const schedule =
    banner.startsAt || banner.endsAt
      ? `${banner.startsAt ? `از ${formatDate(banner.startsAt)}` : ""} ${banner.endsAt ? `تا ${formatDate(banner.endsAt)}` : ""}`.trim()
      : null;

  return (
    <li className="border-t border-ink/5 first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex h-16 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink/5">
            {banner.image ? (
              <>
                <img
                  src={toImageSrc(banner.image)}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
                />
                <div className={`absolute inset-0 ${overlayColor}`} style={{ opacity: (banner.overlay ?? 0) / 100 }} />
              </>
            ) : (
              <ImageOff size={20} className="text-ink/25" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-bold text-ink">{banner.title}</p>
              <Badge tone={status.live ? "blue" : "neutral"}>{status.label}</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-ink/50">
              {PLACEMENT_LABELS[banner.placement] || banner.placement}
              {banner.subtitle ? ` • ${banner.subtitle}` : ""}
            </p>
            {schedule && <p className="mt-0.5 text-xs text-ink/40">{schedule}</p>}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Switch checked={active} onChange={() => onToggle(banner)} loading={toggling} label={`فعال بودن ${banner.title}`} />
        </div>

        <div className="flex w-full items-center justify-end md:w-auto">
          {position && position.count > 1 && (
            <>
              <button
                type="button"
                onClick={() => onMove(banner, "up")}
                disabled={moving || position.index === 0}
                aria-label="انتقال به بالا"
                title="انتقال به بالا"
                className={iconAction}
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => onMove(banner, "down")}
                disabled={moving || position.index === position.count - 1}
                aria-label="انتقال به پایین"
                title="انتقال به پایین"
                className={iconAction}
              >
                <ChevronDown size={18} />
              </button>
            </>
          )}
          <button type="button" onClick={() => onEdit(banner)} aria-label="ویرایش" title="ویرایش" className={iconAction}>
            <Pencil size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(banner)}
            aria-label="حذف"
            title="حذف"
            className={`${iconAction} hover:bg-red-50 hover:text-red-600`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default BannerRow;