import { useLibrary } from '../../state/LibraryContext';
import { SlideOver } from '../Modal';
import { LibrarySearch } from '../LibrarySearch';

/** Slide-over variant of the search, optimised for pasting long text. */
export function SearchPanel() {
  const { closePanel, t } = useLibrary();
  return (
    <SlideOver title={t('textToPage.title')} subtitle={t('textToPage.subtitle')} onClose={closePanel}>
      <LibrarySearch variant="panel" />
    </SlideOver>
  );
}
