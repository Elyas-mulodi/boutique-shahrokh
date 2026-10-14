import Card from "./Card";
import Skeleton from "./Skeleton";
import ChangeBadge from "./ChangeBadge";

function StatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  change,
  loading = false,
  iconClassName = "bg-ink/5 text-ink/60",
}) {
  return (
    <Card padding="p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-ink/50 md:text-sm">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
            <Icon size={18} />
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <>
          <p className="mt-2 break-words font-heading text-lg font-bold text-ink md:text-2xl">
            {value}
            {unit && <span className="mr-1 text-xs font-normal text-ink/40">{unit}</span>}
          </p>
          <div className="mt-1.5 flex min-h-5 flex-wrap items-center gap-2">
            {change !== undefined && <ChangeBadge change={change} />}
            {hint && <span className="text-xs text-ink/40">{hint}</span>}
          </div>
        </>
      )}
    </Card>
  );
}

export default StatCard;