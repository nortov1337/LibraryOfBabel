import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { IconCheck, IconClose, IconInfo } from './icons';

export function Toasts() {
  const { toasts, dismiss } = useToast();
  const { t } = useLibrary();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-soft animate-slide-in-right"
        >
          <span
            className={
              toast.tone === 'error'
                ? 'mt-0.5 text-app-danger'
                : toast.tone === 'success'
                  ? 'mt-0.5 text-app-success'
                  : 'mt-0.5 text-app-accent'
            }
          >
            {toast.tone === 'success' ? <IconCheck width={16} height={16} /> : <IconInfo width={16} height={16} />}
          </span>
          <p className="flex-1 text-sm text-app-text">{toast.message}</p>
          <button
            type="button"
            aria-label={t('common.close')}
            className="text-app-faint transition hover:text-app-text"
            onClick={() => dismiss(toast.id)}
          >
            <IconClose width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
