import { useEffect, type ReactNode } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { IconClose } from './icons';

interface PanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

export function SlideOver({ title, subtitle, onClose, children, footer }: PanelProps) {
  useEscape(onClose);
  const { t } = useLibrary();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 cursor-default bg-app-overlay backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-label={title}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-app-border bg-app-solid shadow-2xl backdrop-blur-2xl animate-slide-in-right"
      >
        <header className="flex items-start justify-between gap-4 border-b border-app-border px-6 py-5">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-app-text">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-app-faint">{subtitle}</p>}
          </div>
          <button type="button" className="btn btn-ghost h-9 w-9 !px-0" aria-label={t('common.close')} onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-app-border px-6 py-4">{footer}</footer>}
      </section>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEscape(onClose);
  const { t } = useLibrary();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 cursor-default bg-app-overlay backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-label={title}
        className={`relative z-10 max-h-[85vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-app-border bg-app-solid p-6 shadow-2xl backdrop-blur-2xl animate-scale-in`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-wide text-app-text">{title}</h2>
          <button type="button" className="btn btn-ghost h-9 w-9 !px-0" aria-label={t('common.close')} onClick={onClose}>
            <IconClose />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
