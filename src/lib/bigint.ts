/**
 * Arbitrary-precision helpers for the positional (base-N) library model.
 *
 * The library is a positional numeral system: a page is a sequence of
 * exactly PAGE_LENGTH digits in base N (N = alphabet size), and that digit
 * sequence is also the big-endian representation of the page index.
 * All of these functions are pure and independent from any UI.
 */

/** Fast exponentiation for BigInt. */
export function pow(base: bigint, exponent: number): bigint {
  if (exponent < 0) throw new Error('pow: negative exponent');
  let result = 1n;
  let b = base;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result *= b;
    b *= b;
    e >>= 1;
  }
  return result;
}

/** Number of bits required to represent a non-negative bigint. */
export function bitLength(value: bigint): number {
  if (value < 0n) throw new Error('bitLength: negative value');
  if (value === 0n) return 0;
  return value.toString(2).length;
}

/**
 * Big-endian digit extraction. Fills a fixed-length array, so leading zeros
 * are preserved and the result length is always `length`.
 */
export function toDigits(value: bigint, base: number, length: number): Uint16Array {
  if (value < 0n) throw new Error('toDigits: negative value');
  if (base < 2) throw new Error('toDigits: base must be >= 2');
  const digits = new Uint16Array(length);
  const B = BigInt(base);
  let x = value;
  for (let i = length - 1; i >= 0; i--) {
    const q = x / B;
    digits[i] = Number(x - q * B);
    x = q;
  }
  return digits;
}

/** Horner evaluation: big-endian digits -> bigint. */
export function fromDigits(digits: ArrayLike<number>, base: number): bigint {
  if (base < 2) throw new Error('fromDigits: base must be >= 2');
  const B = BigInt(base);
  let x = 0n;
  for (let i = 0; i < digits.length; i++) {
    x = x * B + BigInt(digits[i]);
  }
  return x;
}

/**
 * Uniform random bigint in [0, maxExclusive) using the platform CSPRNG.
 * Used ONLY to pick page addresses, never to derive page content.
 */
export function randomBigIntLessThan(maxExclusive: bigint): bigint {
  if (maxExclusive <= 0n) throw new Error('randomBigIntLessThan: max must be positive');
  const bits = bitLength(maxExclusive);
  const byteLength = Math.ceil(bits / 8);
  const buf = new Uint8Array(byteLength);
  const excess = byteLength * 8 - bits;
  for (let attempt = 0; attempt < 1000; attempt++) {
    crypto.getRandomValues(buf);
    let x = 0n;
    for (let i = 0; i < byteLength; i++) x = (x << 8n) | BigInt(buf[i]);
    if (excess > 0) x >>= BigInt(excess);
    if (x < maxExclusive) return x;
  }
  // Practically unreachable (acceptance probability >= 0.5 each round).
  throw new Error('randomBigIntLessThan: failed to sample');
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B64_INDEX: Record<string, number> = {};
for (let i = 0; i < B64.length; i++) B64_INDEX[B64[i]] = i;

/** Minimal big-endian bytes for a non-negative bigint (no leading zero bytes). */
export function bigintToBytes(value: bigint): Uint8Array {
  if (value < 0n) throw new Error('bigintToBytes: negative value');
  if (value === 0n) return new Uint8Array([0]);
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

export function bytesToBigint(bytes: Uint8Array): bigint {
  let x = 0n;
  for (let i = 0; i < bytes.length; i++) x = (x << 8n) | BigInt(bytes[i]);
  return x;
}

/** URL-safe base64 without padding. */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let out = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    if (i + 1 < len) out += B64[((b1 & 15) << 2) | (b2 >> 6)];
    if (i + 2 < len) out += B64[b2 & 63];
  }
  return out;
}

export function base64UrlToBytes(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9_-]/g, '');
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const v = B64_INDEX[clean[i]];
    if (v === undefined) throw new Error('base64UrlToBytes: invalid character');
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}
