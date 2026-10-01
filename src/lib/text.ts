/**
 * Pure text utilities used by the page renderer: finding all occurrences of a
 * query, mapping a click to the surrounding word/token, and splitting the page
 * into highlighted segments. No DOM access here, so it is trivially testable.
 */

export interface Range {
  start: number;
  end: number;
}

export type SegmentKind = 'plain' | 'search' | 'search-active' | 'click';

export interface Segment {
  start: number;
  text: string;
  kind: SegmentKind;
}

export interface SearchState {
  query: string;
  matches: number[];
  active: number;
}

const WHITESPACE = /\s/;

export function isWhitespace(char: string): boolean {
  return WHITESPACE.test(char);
}

/**
 * Return every start index where `query` occurs in `text` (overlaps included).
 */
export function findAllMatches(text: string, query: string): number[] {
  if (!query) return [];
  const matches: number[] = [];
  let index = text.indexOf(query);
  while (index !== -1) {
    matches.push(index);
    index = text.indexOf(query, index + 1);
    if (matches.length > 20000) break;
  }
  return matches;
}

/**
 * The token (maximal run of non-whitespace characters) surrounding `offset`.
 * Returns null for whitespace so clicking empty space does nothing.
 * Punctuation attached to a word is part of the same token, which matches how
 * readers perceive words visually.
 */
export function wordRangeAt(text: string, offset: number): Range | null {
  if (text.length === 0) return null;
  let i = offset;
  if (i < 0) i = 0;
  if (i >= text.length) i = text.length - 1;
  if (isWhitespace(text[i])) return null;

  let start = i;
  while (start > 0 && !isWhitespace(text[start - 1])) start--;
  let end = i + 1;
  while (end < text.length && !isWhitespace(text[end])) end++;
  return { start, end };
}

function flagKind(flag: number): SegmentKind {
  if (flag & 4) return 'search-active';
  if (flag & 1) return 'search';
  if (flag & 2) return 'click';
  return 'plain';
}

/**
 * Split `text` into contiguous segments, each tagged with its highlight kind.
 * Search wins over click when they overlap, and the active search match wins
 * over other search matches.
 */
export function buildSegments(
  text: string,
  search: SearchState | null,
  clickRanges: Range[],
): Segment[] {
  const length = text.length;
  if (length === 0) return [];

  const flags = new Uint8Array(length);

  if (search && search.query.length > 0) {
    const queryLength = search.query.length;
    for (let m = 0; m < search.matches.length; m++) {
      const start = search.matches[m];
      const end = Math.min(length, start + queryLength);
      const bit = m === search.active ? 5 : 1; // 5 = 1 | 4
      for (let i = Math.max(0, start); i < end; i++) flags[i] |= bit;
    }
  }

  for (const range of clickRanges) {
    const end = Math.min(length, range.end);
    for (let i = Math.max(0, range.start); i < end; i++) flags[i] |= 2;
  }

  const segments: Segment[] = [];
  let segStart = 0;
  let current = flagKind(flags[0]);
  for (let i = 1; i <= length; i++) {
    const kind = i < length ? flagKind(flags[i]) : null;
    if (kind !== current || i === length) {
      segments.push({ start: segStart, text: text.slice(segStart, i), kind: current });
      if (i < length) {
        segStart = i;
        current = kind as SegmentKind;
      }
    }
  }
  return segments;
}

export function rangesEqual(a: Range, b: Range): boolean {
  return a.start === b.start && a.end === b.end;
}

export function toggleRange(ranges: Range[], range: Range): Range[] {
  const index = ranges.findIndex((r) => rangesEqual(r, range));
  if (index >= 0) {
    const next = ranges.slice();
    next.splice(index, 1);
    return next;
  }
  return [...ranges, range].sort((a, b) => a.start - b.start);
}
