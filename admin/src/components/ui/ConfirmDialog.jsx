import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({
  open,
  title = "تایید عملیات",
  message,
  confirmLabel = "تایید",
  cancelLabel = "انصراف",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!loading}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-7 text-ink/70">{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;