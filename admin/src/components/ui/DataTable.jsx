import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

const frame = "overflow-hidden rounded-2xl border border-ink/10 bg-white";

function TableHead({ columns }) {
  return (
    <thead>
      <tr className="bg-ink/[0.03]">
        {columns.map((col) => (
          <th
            key={col.key}
            className={`whitespace-nowrap px-4 py-3 text-xs font-bold text-ink/50 ${
              col.align === "end" ? "text-end" : "text-start"
            } ${col.headerClassName || ""}`}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function DataTable({
  columns,
  rows = [],
  rowKey = "_id",
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  emptyTitle = "موردی یافت نشد",
  emptyDescription,
  emptyAction,
  renderMobileCard,
  onRowClick,
  skeletonRows = 8,
}) {
  const desktopOnly = renderMobileCard ? "hidden md:block" : "";

  if (error) {
    return (
      <div className={frame}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={frame}>
        <div className={`overflow-x-auto ${desktopOnly}`}>
          <table className="w-full min-w-[640px] text-sm">
            <TableHead columns={columns} />
            <tbody>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-t border-ink/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderMobileCard && (
          <div className="divide-y divide-ink/5 md:hidden">
            {Array.from({ length: Math.min(skeletonRows, 5) }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={frame}>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  const clickable = Boolean(onRowClick);

  return (
    <div className={frame}>
      <div className={`overflow-x-auto ${desktopOnly}`}>
        <table className="w-full min-w-[640px] text-sm">
          <TableHead columns={columns} />
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={clickable ? () => onRowClick(row) : undefined}
                onKeyDown={clickable ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                tabIndex={clickable ? 0 : undefined}
                className={`border-t border-ink/5 transition-colors hover:bg-ink/[0.02] ${
                  clickable ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-ink ${col.align === "end" ? "text-end" : "text-start"} ${
                      col.className || ""
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderMobileCard && (
        <div className="divide-y divide-ink/5 md:hidden">
          {rows.map((row) => (
            <div
              key={row[rowKey]}
              onClick={clickable ? () => onRowClick(row) : undefined}
              className={clickable ? "cursor-pointer active:bg-ink/[0.03]" : ""}
            >
              {renderMobileCard(row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DataTable;