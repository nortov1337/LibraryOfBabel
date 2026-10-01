/**
 * Page addressing.
 *
 * Address is the URL-safe base64 encoding of the minimal big-endian byte
 * representation of the page index. Encoding is a bijection, so:
 *   decodeAddress(encodeAddress(i)) === i
 *   encodeAddress(decodeAddress(a)) === a (canonical form)
 *
 * Note: because a page carries PAGE_LENGTH * log2(N) bits of entropy, an
 * address is only "compact" relative to a hexadecimal dump; it is not a
 * short hash. This is the information-theoretic price of an exact,
 * enumerable positional library and is documented in the UI.
 */

import { bigintToBytes, bytesToBase64Url, base64UrlToBytes, bytesToBigint } from './bigint';

export function encodeAddress(index: bigint): string {
  return bytesToBase64Url(bigintToBytes(index));
}

export function decodeAddress(address: string): bigint {
  const clean = address.trim();
  if (clean === '') return 0n;
  return bytesToBigint(base64UrlToBytes(clean));
}

export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return /^[A-Za-z0-9_-]+$/.test(address);
}

/** Short, human-friendly fingerprint for display (never used for decoding). */
export function shortAddress(address: string, head = 12, tail = 8): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
