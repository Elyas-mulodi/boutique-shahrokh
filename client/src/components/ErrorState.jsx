import { AlertTriangle, RefreshCw } from "lucide-react";

function ErrorState({ message = "مشکلی در دریافت اطلاعات پیش آمد", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertTriangle size={28} className="text-ink/40" />
      <p className="font-body text-ink/60 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-blue text-sm font-body hover:underline mt-1"
        >
          <RefreshCw size={14} />
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

export default ErrorState;