/** Local bookmarks stored in localStorage. */

import type { GenerationMode } from './settings';

export interface Bookmark {
  id: string;
  address: string;
  title: string;
  createdAt: number;
  preview: string;
  alphabetCode: string;
  generationMode: GenerationMode;
}

const BOOKMARKS_KEY = 'babel:bookmarks:v1';

export function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (b) =>
          b && typeof b.id === 'string' && typeof b.address === 'string' && typeof b.title === 'string',
      )
      .map(
        (b): Bookmark => ({
          ...b,
          generationMode: b.generationMode === 'pseudo' ? 'pseudo' : 'traditional',
        }),
      );
  } catch {
    return [];
  }
}

function persist(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
}

export function createBookmark(input: {
  address: string;
  title: string;
  preview: string;
  alphabetCode: string;
  generationMode: GenerationMode;
}): Bookmark {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    address: input.address,
    title: input.title,
    preview: input.preview.slice(0, 140),
    alphabetCode: input.alphabetCode,
    generationMode: input.generationMode,
    createdAt: Date.now(),
  };
}

export function addBookmark(bookmarks: Bookmark[], bookmark: Bookmark): Bookmark[] {
  const next = [bookmark, ...bookmarks.filter((b) => b.address !== bookmark.address)];
  persist(next);
  return next;
}

export function removeBookmark(bookmarks: Bookmark[], id: string): Bookmark[] {
  const next = bookmarks.filter((b) => b.id !== id);
  persist(next);
  return next;
}

export function renameBookmark(bookmarks: Bookmark[], id: string, title: string): Bookmark[] {
  const next = bookmarks.map((b) => (b.id === id ? { ...b, title } : b));
  persist(next);
  return next;
}
