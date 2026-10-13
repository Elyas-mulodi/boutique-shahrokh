import { Inbox } from "lucide-react";

function EmptyState({ icon: Icon = Inbox, title = "موردی یافت نشد", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
        <Icon size={24} className="text-ink/30" />
      </div>
      <p className="font-bold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm leading-6 text-ink/50">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;