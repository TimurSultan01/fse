declare module 'toastify-js' {
  type ToastifyOptions = {
    text?: string;
    duration?: number;
    close?: boolean;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
    stopOnFocus?: boolean;
    style?: Partial<CSSStyleDeclaration>;
  };

  export default function Toastify(options: ToastifyOptions): {
    showToast: () => void;
  };
}
