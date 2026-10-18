import { ChevronDown, ChevronUp, CornerDownLeft, FolderPlus, Pencil, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Switch from "../../components/ui/Switch";
import Thumb from "../../components/ui/Thumb";
import { formatNumber } from "../../utils/format";

const iconAction =
  "flex h-9 w-9 items-center justify-center rounded-xl text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/40";

function Counts({ category }) {
  return (
    <>
      <Badge tone={category.productsCount ? "blue" : "neutral"}>{formatNumber(category.productsCount)} محصول</Badge>
      {category.childrenCount > 0 && <Badge tone="neutral">{formatNumber(category.childrenCount)} زیردسته</Badge>}
    </>
  );
}

function CategoryRow({
  category,
  active,
  toggling,
  position,
  showMove,
  moving,
  canAddChild,
  onToggle,
  onMove,
  onAddChild,
  onEdit,
  onDelete,
}) {
  const { depth } = category;
  const movable = showMove && position && position.count > 1;

  return (
    <li className="border-t border-ink/5 first:border-t-0">
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 pe-4 md:flex-nowrap"
        style={{ paddingInlineStart: 16 + depth * 28 }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {depth > 0 && <CornerDownLeft size={15} className="flex-shrink-0 text-ink/25" />}
          <Thumb key={category.image || "none"} src={category.image} alt={category.name} className="h-12 w-12" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-bold text-ink">{category.name}</p>
              {!active && <Badge tone="neutral">غیرفعال</Badge>}
            </div>
            <p className="truncate text-xs text-ink/40" dir="ltr" style={{ textAlign: "right" }}>
              {category.slug}
            </p>
          </div>
        </div>

        <div className="hidden flex-shrink-0 items-center gap-2 md:flex">
          <Counts category={category} />
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Switch checked={active} onChange={() => onToggle(category)} loading={toggling} label={`فعال بودن ${category.name}`} />
          <span className="w-12 text-xs text-ink/50">{active ? "فعال" : "غیرفعال"}</span>
        </div>

        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <Counts category={category} />
          </div>

          <div className="flex items-center">
            {movable && (
              <>
                <button
                  type="button"
                  onClick={() => onMove(category, "up")}
                  disabled={moving || position.index === 0}
                  aria-label="انتقال به بالا"
                  title="انتقال به بالا"
                  className={iconAction}
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(category, "down")}
                  disabled={moving || position.index === position.count - 1}
                  aria-label="انتقال به پایین"
                  title="انتقال به پایین"
                  className={iconAction}
                >
                  <ChevronDown size={18} />
                </button>
              </>
            )}
            {canAddChild && (
              <button
                type="button"
                onClick={() => onAddChild(category)}
                aria-label="افزودن زیردسته"
                title="افزودن زیردسته"
                className={iconAction}
              >
                <FolderPlus size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(category)}
              aria-label="ویرایش"
              title="ویرایش"
              className={iconAction}
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              aria-label="حذف"
              title="حذف"
              className={`${iconAction} hover:bg-red-50 hover:text-red-600`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default CategoryRow;