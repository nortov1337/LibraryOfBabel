/** URL state encoding/decoding for book pages. */

import type { DisplayMode, GenerationMode } from './settings';

export interface BookUrlState {
  address: string;
  alphabetCode?: string;
  mode?: DisplayMode;
  generationMode?: GenerationMode;
  position?: number;
  query?: string;
}

export function buildQuery(state: Omit<BookUrlState, 'address'>): string {
  const sp = new URLSearchParams();
  if (state.alphabetCode) sp.set('a', state.alphabetCode);
  if (state.mode) sp.set('m', state.mode);
  // Always pin the generation mode so a shared URL unambiguously restores it.
  if (state.generationMode) sp.set('g', state.generationMode);
  if (state.position != null) sp.set('p', String(state.position));
  if (state.query) sp.set('q', state.query);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function buildBookPath(state: BookUrlState): string {
  return `/book/${state.address}${buildQuery(state)}`;
}

export function parseQuery(search: string): {
  a?: string;
  m?: DisplayMode;
  g?: GenerationMode;
  p?: number;
  q?: string;
} {
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const result: { a?: string; m?: DisplayMode; g?: GenerationMode; p?: number; q?: string } = {};
  const a = sp.get('a');
  if (a) result.a = a;
  const m = sp.get('m');
  if (m === 'book' || m === 'terminal' || m === 'minimal') result.m = m;
  const g = sp.get('g');
  if (g === 'traditional' || g === 'pseudo') result.g = g;
  const p = sp.get('p');
  if (p != null && /^\d+$/.test(p)) result.p = parseInt(p, 10);
  const q = sp.get('q');
  if (q != null) result.q = q;
  return result;
}
