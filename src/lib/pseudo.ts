/**
 * Pseudo-random generation layer (independent of the traditional algorithm).
 *
 * The traditional library maps the page index directly to base-N digits.
 * The pseudo-random mode keeps the very same address/index space but applies a
 * deterministic, invertible mixing permutation `T` to the digit vector:
 *
 *   address -> index -> digits -> [ seed mixer -> seeded PRNG rounds ] -> T(digits) -> text
 *
 * `T` is a 4-round Feistel network over (Z_N)^PAGE_LENGTH whose round function
 * is a seeded PRNG hashed from the whole half-block. Feistel is invertible for
 * ANY round function, which gives two important properties at once:
 *
 *   1. Avalanche: neighbouring indices produce completely different pages.
 *   2. Constructibility: to make a page contain a phrase we build the desired
 *      output digits and apply T^-1, so the found text is guaranteed present.
 *
 * The number of pages is unchanged (still N^PAGE_LENGTH); only the way a page
 * is rendered differs.
 */

import { fromDigits, toDigits } from './bigint';
import { PAGE_LENGTH } from './constants';

const ROUNDS = 4;
const HALF = PAGE_LENGTH >> 1;
const ROUND_KEY = 0x85ebca6b;

function mix32(value: number): number {
  let x = value >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x45d9f3b);
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x45d9f3b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x;
}

function splitmix32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return t >>> 0;
  };
}

/** Seed mixer + seeded PRNG: hash a whole half-block into half-length digits. */
function roundFunction(half: Uint16Array, round: number, base: number): Uint16Array {
  let h = (0x9e3779b9 ^ Math.imul(round + 1, ROUND_KEY)) >>> 0;
  for (let i = 0; i < half.length; i++) {
    h = mix32(h ^ half[i]);
  }
  h = mix32(h ^ half.length);

  const rng = splitmix32(h);
  const out = new Uint16Array(half.length);
  for (let i = 0; i < out.length; i++) {
    out[i] = rng() % base;
  }
  return out;
}

/** Forward mixing: digits -> mixed digits. */
export function forwardFeistel(digits: Uint16Array, base: number): Uint16Array {
  const a = digits.subarray(0, HALF).slice();
  const b = digits.subarray(HALF, PAGE_LENGTH).slice();
  const result = new Uint16Array(PAGE_LENGTH);

  for (let round = 0; round < ROUNDS; round++) {
    const f = roundFunction(b, round, base);
    // newB = (a + f) mod base ; newA = b
    for (let i = 0; i < HALF; i++) {
      const value = a[i] + f[i];
      f[i] = value >= base ? value - base : value;
    }
    a.set(b);
    b.set(f);
  }

  result.set(a, 0);
  result.set(b, HALF);
  return result;
}

/** Inverse mixing: mixed digits -> original digits. */
export function inverseFeistel(mixed: Uint16Array, base: number): Uint16Array {
  const a = mixed.subarray(0, HALF).slice();
  const b = mixed.subarray(HALF, PAGE_LENGTH).slice();
  const result = new Uint16Array(PAGE_LENGTH);

  for (let round = ROUNDS - 1; round >= 0; round--) {
    // given a = B_r, b = B_{r+1} = A_r + F(B_r):  B_r = a, A_r = b - F(a)
    const f = roundFunction(a, round, base);
    for (let i = 0; i < HALF; i++) {
      const value = b[i] - f[i];
      f[i] = value < 0 ? value + base : value;
    }
    b.set(a);
    a.set(f);
  }

  result.set(a, 0);
  result.set(b, HALF);
  return result;
}

/** index -> mixed base-N digits (length PAGE_LENGTH). */
export function pseudoDigitsFromIndex(index: bigint, base: number): Uint16Array {
  return forwardFeistel(toDigits(index, base, PAGE_LENGTH), base);
}

/** Desired page digits -> index such that forwardFeistel(digits) === desired. */
export function pseudoIndexFromDigits(desired: Uint16Array, base: number): bigint {
  return fromDigits(inverseFeistel(desired, base), base);
}
