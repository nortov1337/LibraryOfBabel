import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildAlphabet,
  decodeAlphabet,
  encodeAlphabet,
  type GroupId,
} from '../lib/alphabet';
import { decodeAddress, encodeAddress, shortAddress } from '../lib/address';
import { normalizeIndex, pageSpaceSize, verifyPage } from '../lib/page';
import { randomBigIntLessThan } from '../lib/bigint';
import { engine } from '../lib/engine';
import { copyToClipboard } from '../lib/clipboard';
import { buildBookPath } from '../lib/url';
import { findAllMatches, type SearchState } from '../lib/text';
import {
  createTranslator,
  formatDateTime,
  formatNumber,
  formatPercent,
  type Language,
  type TranslationKey,
  type Translator,
} from '../lib/i18n';
import {
  loadBookmarks,
  addBookmark,
  createBookmark,
  removeBookmark as removeBookmarkFrom,
  renameBookmark as renameBookmarkIn,
  type Bookmark,
} from '../lib/bookmarks';
import {
  loadSettings,
  saveSettings,
  saveLastSession,
  modeForTheme,
  prefersDark,
  resolveTheme,
  type DisplayMode,
  type GenerationMode,
  type ResolvedTheme,
  type Settings,
  type Theme,
} from '../lib/settings';
import { useToast } from './ToastContext';

export type PanelKind =
  | 'search'
  | 'bookmarks'
  | 'stats'
  | 'settings'
  | 'compare'
  | 'debug'
  | 'about'
  | null;

export interface VerificationState {
  status: 'idle' | 'running' | 'ok' | 'fail';
  checksum?: string;
  errorKey?: TranslationKey;
  errorDetail?: string;
}

export interface LibraryError {
  key: TranslationKey;
  detail?: string;
}

interface NavigateOptions {
  position?: number;
  query?: string;
  alphabetCode?: string;
  mode?: DisplayMode;
  generationMode?: GenerationMode;
  replace?: boolean;
}

interface LibraryContextValue {
  settings: Settings;
  alphabet: string[];
  alphabetCode: string;
  mode: DisplayMode;
  generationMode: GenerationMode;
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  address: string;
  index: bigint;
  text: string;
  loading: boolean;
  error: LibraryError | null;
  /** All occurrences of the active search query on the current page. */
  search: SearchState | null;
  bookmarks: Bookmark[];
  panel: PanelKind;
  paletteOpen: boolean;
  searchFocusToken: number;
  verification: VerificationState;
  language: Language;
  t: Translator;
  number: (value: number | bigint) => string;
  percent: (value: number) => string;
  date: (timestamp: number) => string;

  random: () => void;
  prev: () => void;
  next: () => void;
  goTo: (input: string) => void;
  openPage: (index: bigint, options?: NavigateOptions) => void;
  openLocation: (index: bigint, position: number, query: string) => void;
  openBookmark: (bookmark: Bookmark) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  focusSearch: () => void;

  copyAddress: () => void;
  copyText: () => void;
  share: () => void;
  saveBookmark: (title?: string) => void;
  removeBookmark: (id: string) => void;
  renameBookmark: (id: string, title: string) => void;

  setMode: (mode: DisplayMode) => void;
  setGenerationMode: (mode: GenerationMode) => void;
  toggleGroup: (id: GroupId) => void;
  enableGroups: (ids: GroupId[]) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;

  setPanel: (panel: PanelKind) => void;
  closePanel: () => void;
  setPaletteOpen: (open: boolean) => void;
  verify: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { push } = useToast();

  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LibraryError | null>(null);
  const [index, setIndex] = useState<bigint>(0n);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(0);
  const [searchFocusToken, setSearchFocusToken] = useState(0);
  const [systemDark, setSystemDark] = useState(() => prefersDark());
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle' });

  const addressMatch = /^\/book\/([^/?#]+)/.exec(location.pathname);
  const address = addressMatch ? decodeURIComponent(addressMatch[1]) : '';
  const alphabetCode = searchParams.get('a') ?? encodeAlphabet(settings.groups);
  const urlMode = searchParams.get('m');
  const urlQuery = searchParams.get('q');
  const mode: DisplayMode =
    urlMode === 'book' || urlMode === 'terminal' || urlMode === 'minimal' ? urlMode : settings.mode;
  // Priority: URL mode > saved preference > default (traditional).
  const urlGeneration = searchParams.get('g');
  const urlGenerationMode: GenerationMode | null =
    urlGeneration === 'pseudo' ? 'pseudo' : urlGeneration === 'traditional' ? 'traditional' : null;
  const generationMode: GenerationMode = urlGenerationMode ?? settings.generationMode;
  const theme = settings.theme;
  const language = settings.language;
  const resolvedTheme = resolveTheme(theme, systemDark);

  const alphabet = useMemo(() => buildAlphabet(decodeAlphabet(alphabetCode)), [alphabetCode]);
  const t = useMemo(() => createTranslator(language), [language]);
  const number = useCallback((value: number | bigint) => formatNumber(language, value), [language]);
  const percent = useCallback((value: number) => formatPercent(language, value), [language]);
  const date = useCallback((timestamp: number) => formatDateTime(language, timestamp), [language]);

  // Adopt alphabet from a shared URL into local settings.
  useEffect(() => {
    setSettings((prev) => {
      const ids = decodeAlphabet(alphabetCode);
      if (encodeAlphabet(prev.groups) === encodeAlphabet(ids)) return prev;
      return { ...prev, groups: ids };
    });
  }, [alphabetCode]);

  // Adopt display mode from a shared URL.
  useEffect(() => {
    if (urlMode !== 'book' && urlMode !== 'terminal' && urlMode !== 'minimal') return;
    setSettings((prev) => (prev.mode === urlMode ? prev : { ...prev, mode: urlMode }));
  }, [urlMode]);

  // Persist settings.
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Track the OS color scheme for the `system` theme.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  // Apply the resolved theme via CSS variables.
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  // Reflect the active language on the document.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Generate the page when address or alphabet changes.
  useEffect(() => {
    if (!address) {
      setText('');
      setIndex(0n);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setVerification({ status: 'idle' });

    let target: bigint;
    try {
      target = normalizeIndex(decodeAddress(address), alphabet);
    } catch {
      if (!cancelled) {
        setError({ key: 'error.invalidAddress' });
        setLoading(false);
      }
      return;
    }
    setIndex(target);

    // Keep the URL canonical (e.g. after the alphabet shrank the space).
    const canonical = encodeAddress(target);
    if (canonical !== address) {
      navigate(`/book/${canonical}${location.search}`, { replace: true });
      return;
    }

    engine
      .generate(target, alphabet, generationMode)
      .then((generated) => {
        if (cancelled) return;
        setText(generated);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError({
          key: 'error.pageComputeFailed',
          detail: err instanceof Error ? err.message : undefined,
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, alphabetCode, alphabet, generationMode, location.search, navigate]);

  // Persist last session.
  useEffect(() => {
    if (!address) return;
    saveLastSession({ address, alphabetCode, mode, generationMode, timestamp: Date.now() });
  }, [address, alphabetCode, mode, generationMode]);

  // Document title.
  useEffect(() => {
    document.title = address
      ? t('app.pageTitle', { id: shortAddress(address, 8, 4) })
      : t('app.title');
  }, [address, t]);

  // Reset the active match whenever the page or query changes.
  useEffect(() => {
    setActiveMatch(0);
  }, [address, urlQuery]);

  const search = useMemo<SearchState | null>(() => {
    if (!urlQuery || text.length === 0) return null;
    const matches = findAllMatches(text, urlQuery);
    if (matches.length === 0) return null;
    return {
      query: urlQuery,
      matches,
      active: Math.min(activeMatch, matches.length - 1),
    };
  }, [urlQuery, text, activeMatch]);

  const nextMatch = useCallback(() => {
    if (!search || search.matches.length < 2) return;
    setActiveMatch((current) => (current + 1) % search.matches.length);
  }, [search]);

  const prevMatch = useCallback(() => {
    if (!search || search.matches.length < 2) return;
    setActiveMatch((current) => (current - 1 + search.matches.length) % search.matches.length);
  }, [search]);

  const focusSearch = useCallback(() => {
    setSearchFocusToken((token) => token + 1);
  }, []);

  const openPage = useCallback(
    (target: bigint, options?: NavigateOptions) => {
      const code = options?.alphabetCode ?? alphabetCode;
      const nextMode = options?.mode ?? mode;
      const nextGeneration = options?.generationMode ?? generationMode;
      navigate(
        buildBookPath({
          address: encodeAddress(target),
          alphabetCode: code,
          mode: nextMode,
          generationMode: nextGeneration,
          position: options?.position,
          query: options?.query,
        }),
        { replace: options?.replace },
      );
    },
    [alphabetCode, mode, generationMode, navigate],
  );

  const random = useCallback(() => {
    const space = pageSpaceSize(alphabet);
    openPage(randomBigIntLessThan(space));
  }, [alphabet, openPage]);

  const prev = useCallback(() => {
    openPage(normalizeIndex(index - 1n, alphabet));
  }, [index, alphabet, openPage]);

  const next = useCallback(() => {
    openPage(normalizeIndex(index + 1n, alphabet));
  }, [index, alphabet, openPage]);

  const goTo = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;
      try {
        const target = /^\d+$/.test(trimmed) ? BigInt(trimmed) : decodeAddress(trimmed);
        openPage(normalizeIndex(target, alphabet));
        setPanel(null);
      } catch {
        push(t('toast.addressParseFailed'), 'error');
      }
    },
    [alphabet, openPage, push, t],
  );

  const openLocation = useCallback(
    (target: bigint, position: number, query: string) => {
      openPage(target, { position, query });
      setActiveMatch(0);
      setPanel(null);
    },
    [openPage],
  );

  const copyAddress = useCallback(async () => {
    if (!address) return;
    const ok = await copyToClipboard(address);
    push(ok ? t('toast.addressCopied') : t('toast.copyFailed'), ok ? 'success' : 'error');
  }, [address, push, t]);

  const copyText = useCallback(async () => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    push(ok ? t('toast.pageTextCopied') : t('toast.copyFailed'), ok ? 'success' : 'error');
  }, [text, push, t]);

  const share = useCallback(async () => {
    if (!address) return;
    const url = `${window.location.origin}${buildBookPath({
      address,
      alphabetCode,
      mode,
      generationMode,
    })}`;
    const ok = await copyToClipboard(url);
    push(ok ? t('toast.shareCopied') : t('toast.shareFailed'), ok ? 'success' : 'error');
  }, [address, alphabetCode, mode, generationMode, push, t]);

  const saveBookmark = useCallback(
    (title?: string) => {
      if (!address) return;
      const bookmark = createBookmark({
        address,
        title: title?.trim() || shortAddress(address),
        preview: text.replace(/\s+/g, ' ').trim().slice(0, 140),
        alphabetCode,
        generationMode,
      });
      setBookmarks((current) => addBookmark(current, bookmark));
      push(t('toast.bookmarkSaved'), 'success');
    },
    [address, alphabetCode, generationMode, text, push, t],
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((current) => removeBookmarkFrom(current, id));
  }, []);

  const renameBookmark = useCallback((id: string, title: string) => {
    setBookmarks((current) => renameBookmarkIn(current, id, title));
  }, []);

  const openBookmark = useCallback(
    (bookmark: Bookmark) => {
      openPage(decodeAddress(bookmark.address), {
        alphabetCode: bookmark.alphabetCode,
        generationMode: bookmark.generationMode,
      });
      setPanel(null);
    },
    [openPage],
  );

  const setMode = useCallback(
    (nextMode: DisplayMode) => {
      setSettings((prev) => ({ ...prev, mode: nextMode }));
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          sp.set('m', nextMode);
          return sp;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const applyModeToUrl = useCallback(
    (nextMode: DisplayMode) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          sp.set('m', nextMode);
          return sp;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setGenerationMode = useCallback(
    (nextGeneration: GenerationMode) => {
      setSettings((prev) => ({ ...prev, generationMode: nextGeneration }));
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          sp.set('g', nextGeneration);
          return sp;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const toggleGroup = useCallback(
    (id: GroupId) => {
      const has = settings.groups.includes(id);
      const groups = has ? settings.groups.filter((g) => g !== id) : [...settings.groups, id];
      if (groups.length === 0) return;
      const code = encodeAlphabet(groups);
      setSettings((prev) => ({ ...prev, groups }));
      setSearchParams(
        (sp) => {
          const next = new URLSearchParams(sp);
          next.set('a', code);
          return next;
        },
        { replace: true },
      );
    },
    [settings.groups, setSearchParams],
  );

  const enableGroups = useCallback(
    (ids: GroupId[]) => {
      if (ids.length === 0) return;
      const groups = Array.from(new Set([...settings.groups, ...ids]));
      const code = encodeAlphabet(groups);
      setSettings((prev) => ({ ...prev, groups }));
      setSearchParams(
        (sp) => {
          const next = new URLSearchParams(sp);
          next.set('a', code);
          return next;
        },
        { replace: true },
      );
    },
    [settings.groups, setSearchParams],
  );

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      const nextMode = modeForTheme(nextTheme);
      setSettings((prev) => ({ ...prev, theme: nextTheme, mode: nextMode }));
      applyModeToUrl(nextMode);
    },
    [applyModeToUrl],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setSettings((prev) => ({ ...prev, language: nextLanguage }));
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  const verify = useCallback(() => {
    if (!address) return;
    setVerification({ status: 'running' });
    try {
      const target = normalizeIndex(decodeAddress(address), alphabet);
      verifyPage(target, alphabet, generationMode)
        .then((result) => {
          setVerification({
            status: result.ok ? 'ok' : 'fail',
            checksum: result.checksum,
          });
        })
        .catch((err: unknown) => {
          setVerification({
            status: 'fail',
            errorKey: 'error.verifyFailed',
            errorDetail: err instanceof Error ? err.message : undefined,
          });
        });
    } catch (err) {
      setVerification({
        status: 'fail',
        errorKey: 'error.verifyFailed',
        errorDetail: err instanceof Error ? err.message : undefined,
      });
    }
  }, [address, alphabet, generationMode]);

  const value: LibraryContextValue = useMemo(
    () => ({
      settings,
      alphabet,
      alphabetCode,
      mode,
      generationMode,
      theme,
      resolvedTheme,
      address,
      index,
      text,
      loading,
      error,
      search,
      bookmarks,
      panel,
      paletteOpen,
      searchFocusToken,
      verification,
      language,
      t,
      number,
      percent,
      date,
      random,
      prev,
      next,
      goTo,
      openPage,
      openLocation,
      openBookmark,
      nextMatch,
      prevMatch,
      focusSearch,
      copyAddress,
      copyText,
      share,
      saveBookmark,
      removeBookmark,
      renameBookmark,
      setMode,
      setGenerationMode,
      toggleGroup,
      enableGroups,
      setTheme,
      toggleTheme,
      setLanguage,
      setPanel,
      closePanel,
      setPaletteOpen,
      verify,
    }),
    [
      settings,
      alphabet,
      alphabetCode,
      mode,
      generationMode,
      theme,
      resolvedTheme,
      address,
      index,
      text,
      loading,
      error,
      search,
      bookmarks,
      panel,
      paletteOpen,
      searchFocusToken,
      verification,
      language,
      t,
      number,
      percent,
      date,
      random,
      prev,
      next,
      goTo,
      openPage,
      openLocation,
      openBookmark,
      nextMatch,
      prevMatch,
      focusSearch,
      copyAddress,
      copyText,
      share,
      saveBookmark,
      removeBookmark,
      renameBookmark,
      setMode,
      setGenerationMode,
      toggleGroup,
      enableGroups,
      setTheme,
      toggleTheme,
      setLanguage,
      closePanel,
      verify,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
