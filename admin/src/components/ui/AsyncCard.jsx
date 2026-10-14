import Card from "./Card";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Spinner from "./Spinner";

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function AsyncCard({
  title,
  subtitle,
  actions,
  state,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  skeleton,
  className = "",
  children,
}) {
  const { data, loading, error, reload } = state;
  const hasData = data !== null && data !== undefined;

  let body;
  if (error) {
    body = <ErrorState message={error} onRetry={reload} />;
  } else if (!hasData) {
    body = skeleton || <DefaultSkeleton />;
  } else if (isEmpty && isEmpty(data)) {
    body = <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  } else {
    body = <div className={`transition-opacity ${loading ? "opacity-50" : ""}`}>{children(data)}</div>;
  }

  return (
    <Card className={className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink/50">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {loading && hasData && <Spinner size={14} className="text-ink/40" />}
          {actions}
        </div>
      </div>
      {body}
    </Card>
  );
}

export default AsyncCard;