import { useState } from 'react';
import { useLibrary } from '../../state/LibraryContext';
import { useToast } from '../../state/ToastContext';
import { shortAddress } from '../../lib/address';
import { copyToClipboard } from '../../lib/clipboard';
import { SlideOver } from '../Modal';
import { IconCheck, IconCopy, IconExternal, IconPencil, IconTrash } from '../icons';

export function BookmarksPanel() {
  const { bookmarks, openBookmark, removeBookmark, renameBookmark, closePanel, date, number, t } =
    useLibrary();
  const { push } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setDraft(title);
  };

  const commit = (id: string) => {
    const title = draft.trim();
    if (title) renameBookmark(id, title);
    setEditingId(null);
  };

  const copy = async (address: string) => {
    const ok = await copyToClipboard(address);
    push(ok ? t('toast.addressCopied') : t('toast.copyFailed'), ok ? 'success' : 'error');
  };

  return (
    <SlideOver
      title={t('bookmarks.title')}
      subtitle={t('bookmarks.subtitle', { count: number(bookmarks.length) })}
      onClose={closePanel}
    >
      {bookmarks.length === 0 ? (
        <div className="mt-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-app-border bg-app-surface text-xl text-app-accent">
            ☆
          </div>
          <p className="mt-4 text-sm text-app-muted">{t('bookmarks.empty')}</p>
          <p className="mt-1 text-xs text-app-faint">{t('bookmarks.emptyHint')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="rounded-xl border border-app-border bg-app-surface p-3">
              <div className="flex items-start justify-between gap-3">
                {editingId === bookmark.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      className="input !py-1.5 text-sm"
                      value={draft}
                      autoFocus
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commit(bookmark.id);
                        if (event.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost h-8 w-8 !px-0"
                      aria-label={t('bookmarks.rename')}
                      onClick={() => commit(bookmark.id)}
                    >
                      <IconCheck width={15} height={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => openBookmark(bookmark)}
                  >
                    <p className="text-sm font-medium text-app-text">{bookmark.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-app-faint">
                      {shortAddress(bookmark.address, 12, 8)}
                    </p>
                  </button>
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-app-faint">
                {bookmark.preview || '—'}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] text-app-faint">
                  {date(bookmark.createdAt)} · {t('bookmarks.alphabet', { code: bookmark.alphabetCode })} ·{' '}
                  {t('bookmarks.mode', {
                    mode:
                      bookmark.generationMode === 'pseudo'
                        ? t('generation.pseudo')
                        : t('generation.traditional'),
                  })}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !px-0"
                    title={t('bookmarks.open')}
                    aria-label={t('bookmarks.open')}
                    onClick={() => openBookmark(bookmark)}
                  >
                    <IconExternal width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !px-0"
                    title={t('bookmarks.copyAddress')}
                    aria-label={t('bookmarks.copyAddress')}
                    onClick={() => copy(bookmark.address)}
                  >
                    <IconCopy width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !px-0"
                    title={t('bookmarks.renameAction')}
                    aria-label={t('bookmarks.renameAction')}
                    onClick={() => startEdit(bookmark.id, bookmark.title)}
                  >
                    <IconPencil width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost h-8 w-8 !px-0 text-app-danger"
                    title={t('bookmarks.delete')}
                    aria-label={t('bookmarks.delete')}
                    onClick={() => removeBookmark(bookmark.id)}
                  >
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SlideOver>
  );
}
