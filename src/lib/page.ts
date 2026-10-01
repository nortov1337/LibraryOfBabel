/**
 * Deterministic page generation.
 *
 * A page is exactly PAGE_LENGTH characters. It is computed on demand from
 * the page index, the alphabet and the generation mode; it is never stored
 * and never uses Math.random. The same index + alphabet + mode always yields
 * the same text.
 *
 * Two independent rendering modes share the same address/index space:
 *  - traditional: index -> base-N digits (the original algorithm).
 *  - pseudo:      index -> base-N digits -> invertible PRNG mixing.
 */

import { fromDigits, pow, toDigits } from './bigint';
import { findUnknownCharacters } from './alphabet';
import { pseudoDigitsFromIndex } from './pseudo';
import { PAGE_LENGTH } from './constants';
import type { GenerationMode } from './settings';

export { PAGE_LENGTH } from './constants';

/** Total number of pages/texts: N^PAGE_LENGTH (identical for both modes). */
export function pageSpaceSize(alphabet: string[]): bigint {
  return pow(BigInt(alphabet.length), PAGE_LENGTH);
}

/** Normalise any index into [0, N^L). */
export function normalizeIndex(index: bigint, alphabet: string[]): bigint {
  const space = pageSpaceSize(alphabet);
  const m = index % space;
  return m < 0n ? m + space : m;
}

/** index -> exactly PAGE_LENGTH characters over the alphabet. */
export function generatePageText(
  index: bigint,
  alphabet: string[],
  mode: GenerationMode = 'traditional',
): string {
  if (alphabet.length < 2) throw new Error('generatePageText: alphabet must have >= 2 symbols');
  const digits =
    mode === 'pseudo'
      ? pseudoDigitsFromIndex(index, alphabet.length)
      : toDigits(index, alphabet.length, PAGE_LENGTH);
  const out: string[] = new Array(PAGE_LENGTH);
  for (let i = 0; i < PAGE_LENGTH; i++) out[i] = alphabet[digits[i]];
  return out.join('');
}

/** text -> index (traditional positional decoding). */
export function pageTextToIndex(text: string, alphabet: string[]): bigint {
  const symbolIndex = new Map<string, number>();
  alphabet.forEach((c, i) => symbolIndex.set(c, i));
  const N = BigInt(alphabet.length);
  let x = 0n;
  for (const ch of text) {
    const d = symbolIndex.get(ch);
    if (d === undefined) {
      throw new Error(`pageTextToIndex: character not in alphabet: ${JSON.stringify(ch)}`);
    }
    x = x * N + BigInt(d);
  }
  return x;
}

export interface PageValidation {
  valid: boolean;
  lengthOk: boolean;
  alphabetOk: boolean;
  unknown: string[];
}

export function validatePage(text: string, alphabet: string[]): PageValidation {
  const lengthOk = text.length === PAGE_LENGTH;
  const unknown = findUnknownCharacters(text, alphabet);
  return { valid: lengthOk && unknown.length === 0, lengthOk, alphabetOk: unknown.length === 0, unknown };
}

/** SHA-256 checksum of the page text (hex). */
export async function pageChecksum(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

/** Re-generate the page and prove it is identical. */
export async function verifyPage(
  index: bigint,
  alphabet: string[],
  mode: GenerationMode = 'traditional',
): Promise<{ ok: boolean; checksum: string }> {
  const first = generatePageText(index, alphabet, mode);
  const second = generatePageText(index, alphabet, mode);
  const checksum = await pageChecksum(first);
  return { ok: first === second, checksum };
}
