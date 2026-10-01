/**
 * Alphabet management.
 *
 * An alphabet is an ordered, de-duplicated list of single characters.
 * The order is canonical (group order below), which makes the alphabet
 * size N and therefore the whole library space deterministic for a given
 * set of enabled groups.
 */

import type { TranslationKey } from './i18n';

export type GroupId = 'ru' | 'en' | 'digits' | 'space' | 'punctuation' | 'special';

export interface AlphabetGroup {
  id: GroupId;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Call-to-action shown when a character is missing. */
  enableKey: TranslationKey;
  defaultOn: boolean;
  chars: string[];
}

const RU_LOWER = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
const RU_UPPER = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
const EN_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
const EN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');
const SPACE = [' '];
const PUNCTUATION = ['.', ',', '!', '?', ';', ':', "'", '"', '«', '»', '(', ')', '[', ']', '{', '}', '—', '–', '…', '-'];
const SPECIAL = ['@', '#', '$', '%', '^', '&', '*', '+', '=', '<', '>', '|', '/', '\\', '~', '`', '_'];

export const GROUPS: AlphabetGroup[] = [
  {
    id: 'ru',
    labelKey: 'alphabet.group.ru',
    descriptionKey: 'alphabet.group.ru.description',
    enableKey: 'alphabet.enable.ru',
    defaultOn: true,
    chars: [...RU_LOWER, ...RU_UPPER],
  },
  {
    id: 'en',
    labelKey: 'alphabet.group.en',
    descriptionKey: 'alphabet.group.en.description',
    enableKey: 'alphabet.enable.en',
    defaultOn: false,
    chars: [...EN_LOWER, ...EN_UPPER],
  },
  {
    id: 'digits',
    labelKey: 'alphabet.group.digits',
    descriptionKey: 'alphabet.group.digits.description',
    enableKey: 'alphabet.enable.digits',
    defaultOn: false,
    chars: DIGITS,
  },
  {
    id: 'space',
    labelKey: 'alphabet.group.space',
    descriptionKey: 'alphabet.group.space.description',
    enableKey: 'alphabet.enable.space',
    defaultOn: true,
    chars: SPACE,
  },
  {
    id: 'punctuation',
    labelKey: 'alphabet.group.punctuation',
    descriptionKey: 'alphabet.group.punctuation.description',
    enableKey: 'alphabet.enable.punctuation',
    defaultOn: true,
    chars: PUNCTUATION,
  },
  {
    id: 'special',
    labelKey: 'alphabet.group.special',
    descriptionKey: 'alphabet.group.special.description',
    enableKey: 'alphabet.enable.special',
    defaultOn: false,
    chars: SPECIAL,
  },
];

export const DEFAULT_GROUPS: GroupId[] = GROUPS.filter((g) => g.defaultOn).map((g) => g.id);

/** Build the ordered, de-duplicated alphabet for a set of enabled groups. */
export function buildAlphabet(groupIds: GroupId[]): string[] {
  const enabled = new Set(groupIds);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const group of GROUPS) {
    if (!enabled.has(group.id)) continue;
    for (const ch of group.chars) {
      if (seen.has(ch)) continue;
      seen.add(ch);
      out.push(ch);
    }
  }
  return out;
}

/** Compact bitmask code of enabled groups, e.g. "7". */
export function encodeAlphabet(groupIds: GroupId[]): string {
  let mask = 0;
  GROUPS.forEach((group, i) => {
    if (groupIds.includes(group.id)) mask |= 1 << i;
  });
  return mask.toString(16);
}

/** Decode a bitmask code; unknown/empty codes fall back to defaults. */
export function decodeAlphabet(code: string | null | undefined): GroupId[] {
  if (!code) return [...DEFAULT_GROUPS];
  const mask = parseInt(code, 16);
  if (!Number.isFinite(mask) || mask <= 0) return [...DEFAULT_GROUPS];
  const ids = GROUPS.filter((g, i) => (mask & (1 << i)) !== 0).map((g) => g.id);
  return ids.length > 0 ? ids : [...DEFAULT_GROUPS];
}

/** Count of digit characters currently present in an alphabet. */
export function countDigits(alphabet: string[]): number {
  return alphabet.filter((c) => c >= '0' && c <= '9').length;
}

/** Stable signal that changes whenever the alphabet changes. */
export function alphabetSignature(alphabet: string[]): string {
  return alphabet.join('');
}

/**
 * Every character of `text` that is absent from `alphabet`.
 * Returns unique characters (iterating Unicode code points, not UTF-16 code
 * units) in order of first appearance. A Set is only used for membership,
 * never for iteration, so ordering is preserved.
 */
export function findUnknownCharacters(text: string, alphabet: string[]): string[] {
  const known = new Set(alphabet);
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const ch of text) {
    if (!known.has(ch) && !seen.has(ch)) {
      seen.add(ch);
      missing.push(ch);
    }
  }
  return missing;
}

export interface MissingCharacter {
  /** Raw character. */
  char: string;
  /** Visible glyph for the character (e.g. "␠" for space, "U+0001" for STX). */
  symbol: string;
  /** Translation key naming invisible characters; undefined for normal chars. */
  nameKey?: TranslationKey;
  /** Unicode code point(s), e.g. "U+0451" or "U+1F600". */
  codePoint: string;
  /** Groups that contain this character (may be empty). */
  groups: GroupId[];
}

const SPECIAL_SYMBOLS: Record<string, { symbol: string; nameKey?: TranslationKey }> = {
  ' ': { symbol: '␠', nameKey: 'missing.space' },
  '\n': { symbol: '↵', nameKey: 'missing.newline' },
  '\t': { symbol: '⇥', nameKey: 'missing.tab' },
  '\r': { symbol: '␍', nameKey: 'missing.cr' },
  '\u00a0': { symbol: '␠', nameKey: 'missing.nbsp' },
  '\u200b': { symbol: '␀', nameKey: 'missing.zwsp' },
  '\u2028': { symbol: '↵', nameKey: 'missing.lineSeparator' },
  '\u2029': { symbol: '¶', nameKey: 'missing.paragraphSeparator' },
  '\u000b': { symbol: '␋', nameKey: 'missing.vt' },
  '\u000c': { symbol: '␌', nameKey: 'missing.ff' },
};

/** Visible glyph that makes invisible characters visible. Language-neutral. */
export function characterSymbol(char: string): string {
  const special = SPECIAL_SYMBOLS[char];
  if (special) return special.symbol;
  const codePoint = char.codePointAt(0) ?? 0;
  if (codePoint < 0x20 || codePoint === 0x7f) {
    return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  return char;
}

/** Translation key naming an invisible character, if it has one. */
export function characterNameKey(char: string): TranslationKey | undefined {
  return SPECIAL_SYMBOLS[char]?.nameKey;
}

/** Unicode code point label(s) for a character. */
export function codePointLabel(char: string): string {
  return Array.from(char)
    .map((c) => `U+${(c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}

/** Groups that contain a given character. */
export function groupsForCharacter(char: string): GroupId[] {
  return GROUPS.filter((group) => group.chars.includes(char)).map((group) => group.id);
}

/**
 * Full description of the missing characters of `text`, in first-appearance
 * order, with display glyphs, Unicode code points and the groups that could
 * add them. The characters themselves are language-independent.
 */
export function describeMissingCharacters(text: string, alphabet: string[]): MissingCharacter[] {
  return findUnknownCharacters(text, alphabet).map((char) => ({
    char,
    symbol: characterSymbol(char),
    nameKey: characterNameKey(char),
    codePoint: codePointLabel(char),
    groups: groupsForCharacter(char),
  }));
}
