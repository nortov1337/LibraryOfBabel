/**
 * Mathematical text search.
 *
 * The library is positional: every sequence of length <= PAGE_LENGTH over the
 * alphabet exists on many pages. We do NOT enumerate pages (impossible). We
 * CONSTRUCT the canonical page that contains the query at deterministic
 * positions:
 *
 *   1. choose positions deterministically from the query,
 *   2. fill the page with deterministic pseudo-random filler,
 *   3. overwrite positions with the query digits,
 *   4. derive the page index.
 *
 * The construction depends on the generation mode:
 *  - traditional: the constructed digits ARE the page digits.
 *  - pseudo: we construct the DESIRED page digits and apply the inverse
 *    pseudo-random mixing, so the resulting index renders (via the forward
 *    mixing) exactly the desired page - the query is guaranteed present.
 *
 * Honest limitation: a query may only be found if all of its characters
 * belong to the current alphabet; the UI reports missing characters and
 * offers to enable the groups that contain them.
 */

import { fromDigits } from './bigint';
import { PAGE_LENGTH } from './constants';
import { pseudoIndexFromDigits } from './pseudo';
import { findUnknownCharacters } from './alphabet';
import type { GenerationMode } from './settings';

export type FindReason = 'empty' | 'too-long' | 'missing-chars';

export interface FindResult {
  found: boolean;
  reason?: FindReason;
  /** Characters absent from the alphabet (when reason === 'missing-chars'). */
  missing: string[];
  queryLength: number;
  /** 0-based character position of the first occurrence inside the page. */
  position: number;
  /** All deterministic positions where the query was placed. */
  positions: number[];
  /** Page index containing the query. */
  index: bigint;
}

function hashString(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EMPTY: FindResult = {
  found: false,
  reason: 'empty',
  missing: [],
  queryLength: 0,
  position: 0,
  positions: [],
  index: 0n,
};

/** Deterministic, non-overlapping slots for placing the query. */
function positionSlots(queryLength: number, seed: number, rng: () => number): number[] {
  const capacity = Math.floor(PAGE_LENGTH / queryLength);
  const wanted = Math.max(1, Math.min(capacity, 2 + (seed % 4)));
  const positions: number[] = [];

  for (let slot = 0; slot < wanted; slot++) {
    const slotStart = Math.floor((slot * PAGE_LENGTH) / wanted);
    const slotEnd = Math.floor(((slot + 1) * PAGE_LENGTH) / wanted) - queryLength;
    if (slotEnd < slotStart) continue;
    positions.push(slotStart + Math.floor(rng() * (slotEnd - slotStart + 1)));
  }

  if (positions.length === 0) positions.push(0);
  return positions;
}

export function findText(
  query: string,
  alphabet: string[],
  mode: GenerationMode = 'traditional',
): FindResult {
  const chars = Array.from(query);
  const K = chars.length;
  if (K === 0) return { ...EMPTY };
  if (K > PAGE_LENGTH) {
    return {
      found: false,
      reason: 'too-long',
      missing: [],
      queryLength: K,
      position: 0,
      positions: [],
      index: 0n,
    };
  }

  const missing = findUnknownCharacters(query, alphabet);
  if (missing.length > 0) {
    return {
      found: false,
      reason: 'missing-chars',
      missing,
      queryLength: K,
      position: 0,
      positions: [],
      index: 0n,
    };
  }

  const symbolIndex = new Map<string, number>();
  alphabet.forEach((c, i) => symbolIndex.set(c, i));

  const N = alphabet.length;
  const seed = hashString(query);
  // Pseudo mode uses a distinct filler stream so its canonical page differs
  // from the traditional one while still being fully deterministic.
  const fillerSeed = mode === 'pseudo' ? seed ^ 0x9e3779b9 : seed;
  const rand = mulberry32(fillerSeed ^ Math.imul(N, 2654435761));

  // Fill the page with deterministic filler, then place the query at several
  // deterministic, non-overlapping slots.
  const digits = new Uint16Array(PAGE_LENGTH);
  for (let i = 0; i < PAGE_LENGTH; i++) digits[i] = Math.floor(rand() * N);

  const positions = positionSlots(K, seed, rand);
  for (const start of positions) {
    for (let j = 0; j < K; j++) digits[start + j] = symbolIndex.get(chars[j]) as number;
  }

  // Pseudo mode: `digits` are the DESIRED output; invert the mixing so the
  // forward (generate) step reproduces exactly this page.
  const index =
    mode === 'pseudo' ? pseudoIndexFromDigits(digits, N) : fromDigits(digits, N);

  return { found: true, missing: [], queryLength: K, position: positions[0], positions, index };
}

/** Search a pasted text of arbitrary length (used by TEXT -> PAGE). */
export function locateText(
  text: string,
  alphabet: string[],
  mode: GenerationMode = 'traditional',
): FindResult & { tooLong?: boolean } {
  const chars = Array.from(text);
  if (chars.length > PAGE_LENGTH) {
    return {
      found: false,
      reason: 'too-long',
      tooLong: true,
      missing: [],
      queryLength: chars.length,
      position: 0,
      positions: [],
      index: 0n,
    };
  }
  return findText(text, alphabet, mode);
}
