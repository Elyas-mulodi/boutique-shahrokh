import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

function ErrorState({ message = "مشکلی در دریافت اطلاعات پیش آمد", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <p className="text-sm text-ink/60">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}

export default ErrorState;