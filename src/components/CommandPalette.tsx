import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import {
  IconBookmark,
  IconCompare,
  IconCopy,
  IconDice,
  IconExternal,
  IconInfo,
  IconSearch,
  IconSettings,
  IconStar,
  IconStats,
  IconTerminal,
} from './icons';

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: ReactNode;
  run: () => void;
}

export function CommandPalette() {
  const library = useLibrary();
  const { t } = library;
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [goToMode, setGoToMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    library.setPaletteOpen(false);
    setQuery('');
    setGoToMode(false);
  };

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'random',
        label: t('palette.random'),
        hint: 'R',
        group: t('palette.group.navigation'),
        icon: <IconDice width={16} height={16} />,
        run: () => library.random(),
      },
      {
        id: 'goto',
        label: t('palette.goto'),
        group: t('palette.group.navigation'),
        icon: <IconExternal width={16} height={16} />,
        run: () => {
          setQuery('');
          setGoToMode(true);
        },
      },
      {
        id: 'find',
        label: t('palette.find'),
        hint: '/',
        group: t('palette.group.navigation'),
        icon: <IconSearch width={16} height={16} />,
        run: () => library.focusSearch(),
      },
      {
        id: 'text-to-page',
        label: t('palette.textToPage'),
        group: t('palette.group.navigation'),
        icon: <IconTerminal width={16} height={16} />,
        run: () => library.setPanel('search'),
      },
      {
        id: 'save',
        label: t('palette.save'),
        hint: 'Ctrl+S',
        group: t('palette.group.page'),
        icon: <IconStar width={16} height={16} />,
        run: () => library.saveBookmark(),
      },
      {
        id: 'compare',
        label: t('palette.compare'),
        group: t('palette.group.page'),
        icon: <IconCompare width={16} height={16} />,
        run: () => library.setPanel('compare'),
      },
      {
        id: 'copy-address',
        label: t('palette.copyAddress'),
        group: t('palette.group.page'),
        icon: <IconCopy width={16} height={16} />,
        run: () => library.copyAddress(),
      },
      {
        id: 'copy-page',
        label: t('palette.copyPage'),
        hint: 'Ctrl+C',
        group: t('palette.group.page'),
        icon: <IconCopy width={16} height={16} />,
        run: () => library.copyText(),
      },
      {
        id: 'toggle-digits',
        label: t('palette.toggleNumbers'),
        group: t('palette.group.alphabet'),
        icon: <IconSettings width={16} height={16} />,
        run: () => library.toggleGroup('digits'),
      },
      {
        id: 'toggle-english',
        label: t('palette.toggleEnglish'),
        group: t('palette.group.alphabet'),
        icon: <IconSettings width={16} height={16} />,
        run: () => library.toggleGroup('en'),
      },
      {
        id: 'toggle-special',
        label: t('palette.toggleSpecial'),
        group: t('palette.group.alphabet'),
        icon: <IconSettings width={16} height={16} />,
        run: () => library.toggleGroup('special'),
      },
      {
        id: 'theme',
        label: t('palette.changeTheme'),
        group: t('palette.group.interface'),
        icon: <IconSettings width={16} height={16} />,
        run: () => library.toggleTheme(),
      },
      {
        id: 'bookmarks',
        label: t('palette.openBookmarks'),
        group: t('palette.group.interface'),
        icon: <IconBookmark width={16} height={16} />,
        run: () => library.setPanel('bookmarks'),
      },
      {
        id: 'stats',
        label: t('palette.stats'),
        group: t('palette.group.interface'),
        icon: <IconStats width={16} height={16} />,
        run: () => library.setPanel('stats'),
      },
      {
        id: 'settings',
        label: t('palette.settings'),
        group: t('palette.group.interface'),
        icon: <IconSettings width={16} height={16} />,
        run: () => library.setPanel('settings'),
      },
      {
        id: 'about',
        label: t('palette.about'),
        group: t('palette.group.interface'),
        icon: <IconInfo width={16} height={16} />,
        run: () => library.setPanel('about'),
      },
    ],
    [library, t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => `${command.group} ${command.label}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    setActive(0);
  }, [query, goToMode]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [goToMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (goToMode) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (query.trim()) {
            library.goTo(query);
            close();
          }
        }
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const command = filtered[active];
        if (command) {
          command.run();
          if (command.id !== 'goto') close();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 cursor-default bg-app-overlay backdrop-blur-sm animate-fade-in"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-app-border bg-app-solid shadow-2xl backdrop-blur-2xl animate-scale-in">
        <div className="flex items-center gap-3 border-b border-app-border px-4">
          <span className="text-app-faint">
            {goToMode ? <IconExternal width={16} height={16} /> : <IconSearch width={16} height={16} />}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={goToMode ? t('palette.goToPlaceholder') : t('palette.placeholder')}
            className="w-full bg-transparent py-4 text-sm text-app-text placeholder:text-app-faint focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="chip !px-2 !py-0.5 font-mono text-[10px]">ESC</kbd>
        </div>

        {!goToMode && (
          <div className="max-h-[52vh] overflow-y-auto py-2">
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-app-faint">{t('palette.noResults')}</p>
            )}
            {filtered.map((command, index) => (
              <button
                key={command.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => {
                  command.run();
                  if (command.id !== 'goto') close();
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  index === active
                    ? 'bg-app-surface-hover text-app-text'
                    : 'text-app-muted hover:bg-app-surface'
                }`}
              >
                <span className="text-app-accent">{command.icon}</span>
                <span className="flex-1">{command.label}</span>
                {command.hint && (
                  <kbd className="chip !px-2 !py-0.5 font-mono text-[10px]">{command.hint}</kbd>
                )}
                <span className="w-24 text-right text-[10px] uppercase tracking-widest text-app-faint">
                  {command.group}
                </span>
              </button>
            ))}
          </div>
        )}

        {goToMode && (
          <div className="px-4 py-4 text-xs text-app-muted">
            {t('palette.goToHint')}{' '}
            <span className="font-mono text-app-text">{t('palette.goToExample')}</span>
            {query.trim() && (
              <button
                type="button"
                className="btn btn-primary mt-3 w-full"
                onClick={() => {
                  library.goTo(query);
                  close();
                }}
              >
                {t('palette.openPage')}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-app-border px-4 py-2 text-[10px] uppercase tracking-widest text-app-faint">
          <span>{t('palette.footer')}</span>
          <button
            type="button"
            className="hover:text-app-muted"
            onClick={() => {
              push('Ctrl+K');
              close();
            }}
          >
            Babel
          </button>
        </div>
      </div>
    </div>
  );
}
