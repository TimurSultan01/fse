import { useConfirmStore } from '../stores/useConfirmStore';

export default function ConfirmDialog() {
  const {
    open,
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone,
    confirm,
    cancel,
  } = useConfirmStore();

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={cancel}>
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>

        <div className="actions">
          <button className="secondary-button" onClick={cancel}>{cancelLabel}</button>
          <button className={tone === 'danger' ? 'danger-button' : undefined} onClick={confirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
