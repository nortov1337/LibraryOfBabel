import { useLibrary } from '../../state/LibraryContext';
import { PAGE_LENGTH } from '../../lib/page';
import { Modal } from '../Modal';

export function AboutModal() {
  const { closePanel, alphabet, t, number } = useLibrary();

  return (
    <Modal title={t('about.title')} onClose={closePanel} maxWidth="max-w-2xl">
      <div className="space-y-4 text-sm leading-relaxed text-app-muted">
        <p>{t('about.intro', { size: number(alphabet.length), length: number(PAGE_LENGTH) })}</p>

        <div className="rounded-xl border border-app-border bg-app-surface p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-app-accent">
            {t('about.howTitle')}
          </p>
          <ul className="space-y-2 text-xs">
            <li>{t('about.how1')}</li>
            <li>{t('about.how2')}</li>
            <li>{t('about.how3')}</li>
            <li>{t('about.how4')}</li>
            <li>{t('about.how5')}</li>
          </ul>
        </div>

        <div className="rounded-xl border border-app-warning bg-app-warning-soft p-4 text-xs text-app-warning">
          <p className="font-semibold">{t('about.limitTitle')}</p>
          <p className="mt-1 leading-relaxed">{t('about.limit')}</p>
        </div>

        <p className="text-xs text-app-faint">{t('about.privacy')}</p>
      </div>
    </Modal>
  );
}
