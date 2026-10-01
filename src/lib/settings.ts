/** Persisted user settings and last-session state. */

import { DEFAULT_GROUPS, type GroupId } from './alphabet';
import { DEFAULT_LANGUAGE, type Language, type TranslationKey } from './i18n';

export type { Language } from './i18n';

/** Page rendering mode (kept for URL state + back-compat). */
export type DisplayMode = 'book' | 'terminal' | 'minimal';

/** How a page is rendered from its index (both share the same address space). */
export type GenerationMode = 'traditional' | 'pseudo';

/** Selectable application themes. */
export type Theme = 'system' | 'dark' | 'light' | 'terminal' | 'minimal';

/** Concrete theme after resolving `system`. */
export type ResolvedTheme = Exclude<Theme, 'system'>;

export interface Settings {
  groups: GroupId[];
  mode: DisplayMode;
  generationMode: GenerationMode;
  theme: Theme;
  language: Language;
}

export interface LastSession {
  address: string;
  alphabetCode: string;
  mode: DisplayMode;
  generationMode: GenerationMode;
  timestamp: number;
}

const SETTINGS_KEY = 'babel:settings:v1';
const SESSION_KEY = 'babel:last-session:v1';

export const THEMES: { id: Theme; labelKey: TranslationKey }[] = [
  { id: 'system', labelKey: 'theme.system' },
  { id: 'dark', labelKey: 'theme.dark' },
  { id: 'light', labelKey: 'theme.light' },
  { id: 'terminal', labelKey: 'theme.terminal' },
  { id: 'minimal', labelKey: 'theme.minimal' },
];

export const DEFAULT_SETTINGS: Settings = {
  groups: [...DEFAULT_GROUPS],
  mode: 'book',
  generationMode: 'traditional',
  theme: 'system',
  language: DEFAULT_LANGUAGE,
};

function isTheme(value: unknown): value is Theme {
  return (
    value === 'system' ||
    value === 'dark' ||
    value === 'light' ||
    value === 'terminal' ||
    value === 'minimal'
  );
}

/** The page mode that best matches an application theme. */
export function modeForTheme(theme: Theme): DisplayMode {
  if (theme === 'terminal') return 'terminal';
  if (theme === 'minimal') return 'minimal';
  return 'book';
}

/** Resolve a possibly-system theme into a concrete one. */
export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

/** Safe prefers-color-scheme probe (works in browsers and tests). */
export function prefersDark(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  } catch {
    return false;
  }
}

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable / quota exceeded - non fatal
  }
}

export function loadSettings(): Settings {
  const stored = safeRead<Partial<Settings>>(SETTINGS_KEY);
  if (!stored) return { ...DEFAULT_SETTINGS };

  const groups =
    Array.isArray(stored.groups) && stored.groups.length > 0
      ? (stored.groups as GroupId[])
      : [...DEFAULT_GROUPS];

  const mode: DisplayMode =
    stored.mode === 'terminal' || stored.mode === 'minimal' || stored.mode === 'book'
      ? stored.mode
      : 'book';

  // Migration: older versions stored theme as dark|light and a separate mode.
  let theme: Theme = isTheme(stored.theme) ? stored.theme : 'system';
  if (!isTheme(stored.theme) && (mode === 'terminal' || mode === 'minimal')) {
    theme = mode;
  }

  const language: Language = stored.language === 'ru' ? 'ru' : DEFAULT_LANGUAGE;
  const generationMode: GenerationMode = stored.generationMode === 'pseudo' ? 'pseudo' : 'traditional';

  return { groups, mode, generationMode, theme, language };
}

export function saveSettings(settings: Settings): void {
  safeWrite(SETTINGS_KEY, settings);
}

export function loadLastSession(): LastSession | null {
  const session = safeRead<Partial<LastSession>>(SESSION_KEY);
  if (!session || typeof session.address !== 'string') return null;
  return {
    address: session.address,
    alphabetCode: session.alphabetCode ?? '',
    mode: session.mode === 'terminal' || session.mode === 'minimal' ? session.mode : 'book',
    generationMode: session.generationMode === 'pseudo' ? 'pseudo' : 'traditional',
    timestamp: session.timestamp ?? 0,
  };
}

export function saveLastSession(session: LastSession): void {
  safeWrite(SESSION_KEY, session);
}
