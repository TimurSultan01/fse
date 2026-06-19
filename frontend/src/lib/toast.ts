import Toastify from 'toastify-js';

type ToastKind = 'success' | 'error' | 'info';

const colors: Record<ToastKind, string> = {
  success: '#067647',
  error: '#b42318',
  info: '#176c72',
};

export function toast(message: string, kind: ToastKind = 'info'): void {
  Toastify({
    text: message,
    duration: 3200,
    close: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: colors[kind],
      borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(23, 32, 51, 0.18)',
      color: '#fff',
      fontWeight: '700',
    },
  }).showToast();
}
