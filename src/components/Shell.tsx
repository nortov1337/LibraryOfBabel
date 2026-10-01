import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useLibrary, type PanelKind } from '../state/LibraryContext';
import { useHotkeys } from '../hooks/useHotkeys';
import { CommandPalette } from './CommandPalette';
import { SearchPanel } from './panels/SearchPanel';
import { BookmarksPanel } from './panels/BookmarksPanel';
import { StatsPanel } from './panels/StatsPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { ComparePanel } from './panels/ComparePanel';
import { DebugPanel } from './panels/DebugPanel';
import { AboutModal } from './panels/AboutModal';
import { LANGUAGES } from '../lib/i18n';
import {
  IconBookmark,
  IconBug,
  IconCommand,
  IconCompare,
  IconInfo,
  IconMoon,
  IconSearch,
  IconSettings,
  IconStats,
  IconSun,
  IconTerminal,
} from './icons';

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-app-muted transition hover:border-app-border hover:bg-app-surface-hover hover:text-app-text"
    >
      {children}
    </button>
  );
}

export function Shell() {
  const {
    setPanel,
    panel,
    paletteOpen,
    setPaletteOpen,
    resolvedTheme,
    toggleTheme,
    focusSearch,
    language,
    setLanguage,
    t,
  } = useLibrary();
  useHotkeys();

  const openPanel = (kind: PanelKind) => setPanel(kind);
  const otherLanguage = language === 'en' ? 'ru' : 'en';
  const otherFlag = LANGUAGES.find((item) => item.id === otherLanguage)?.flag ?? '';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-app-border bg-app-header backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-accent bg-app-accent-soft font-serif text-lg font-semibold text-app-accent">
              B
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[9px] tracking-[0.35em] text-app-accent">{t('app.brandTop')}</span>
              <span className="text-xs font-semibold tracking-[0.28em] text-app-text">
                {t('app.brandBottom')}
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <IconButton label={t('header.search')} onClick={focusSearch}>
              <IconSearch />
            </IconButton>
            <IconButton label={t('header.bookmarks')} onClick={() => openPanel('bookmarks')}>
              <IconBookmark />
            </IconButton>
            <div className="hidden sm:flex">
              <IconButton label={t('header.compare')} onClick={() => openPanel('compare')}>
                <IconCompare />
              </IconButton>
              <IconButton label={t('header.stats')} onClick={() => openPanel('stats')}>
                <IconStats />
              </IconButton>
              <IconButton label={t('header.settings')} onClick={() => openPanel('settings')}>
                <IconSettings />
              </IconButton>
              <IconButton label={t('header.debug')} onClick={() => openPanel('debug')}>
                <IconBug />
              </IconButton>
              <IconButton label={t('header.about')} onClick={() => openPanel('about')}>
                <IconInfo />
              </IconButton>
              <IconButton label={t('header.textToPage')} onClick={() => openPanel('search')}>
                <IconTerminal />
              </IconButton>
            </div>
            <button
              type="button"
              title={t('settings.language')}
              aria-label={t('settings.language')}
              onClick={() => setLanguage(otherLanguage)}
              className="flex h-9 items-center justify-center gap-1 rounded-xl border border-transparent px-2 text-xs font-medium text-app-muted transition hover:border-app-border hover:bg-app-surface-hover hover:text-app-text"
            >
              <span aria-hidden="true">{otherFlag}</span>
              <span className="font-mono uppercase">{otherLanguage}</span>
            </button>
            <IconButton label={t('header.toggleTheme')} onClick={toggleTheme}>
              {resolvedTheme === 'dark' ? <IconSun /> : <IconMoon />}
            </IconButton>
            <button
              type="button"
              aria-label={t('header.commandPalette')}
              onClick={() => setPaletteOpen(true)}
              className="ml-1 flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted transition hover:border-app-border-strong hover:text-app-text"
            >
              <IconCommand width={14} height={14} />
              <span className="hidden font-mono md:inline">Ctrl K</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-app-border px-4 py-6 text-center text-[11px] text-app-faint">
        {t('app.footer')}
      </footer>

      {panel === 'search' && <SearchPanel />}
      {panel === 'bookmarks' && <BookmarksPanel />}
      {panel === 'stats' && <StatsPanel />}
      {panel === 'settings' && <SettingsPanel />}
      {panel === 'compare' && <ComparePanel />}
      {panel === 'debug' && <DebugPanel />}
      {panel === 'about' && <AboutModal />}
      {paletteOpen && <CommandPalette />}
    </div>
  );
}
