import { create } from 'zustand';

type ConfirmTone = 'default' | 'danger';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void | Promise<void>;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: ConfirmTone;
  onConfirm?: () => void | Promise<void>;
  requestConfirmation: (options: ConfirmOptions) => void;
  confirm: () => void;
  cancel: () => void;
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Bestätigen',
  cancelLabel: 'Abbrechen',
  tone: 'default',
  requestConfirmation(options) {
    set({
      open: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Bestätigen',
      cancelLabel: options.cancelLabel ?? 'Abbrechen',
      tone: options.tone ?? 'default',
      onConfirm: options.onConfirm,
    });
  },
  confirm() {
    const action = get().onConfirm;
    set({ open: false, onConfirm: undefined });
    void action?.();
  },
  cancel() {
    set({ open: false, onConfirm: undefined });
  },
}));
