import { createPortal } from "react-dom";
import Button from "../../components/ui/Button";

function SaveBar({ dirty, saving, canSave, busy, onSave, onCancel, saveLabel = "ذخیره" }) {
  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 backdrop-blur-md lg:right-64"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <p className="min-w-0 truncate text-xs text-ink/50">
          {busy ? "در حال آپلود تصویر..." : dirty ? "تغییرات ذخیره‌نشده دارید" : "تغییری انجام نشده است"}
        </p>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            انصراف
          </Button>
          <Button onClick={onSave} loading={saving} disabled={!canSave}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SaveBar;