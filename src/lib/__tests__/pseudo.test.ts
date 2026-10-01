import { describe, expect, it } from 'vitest';
import { buildAlphabet } from '../alphabet';
import {
  PAGE_LENGTH,
  generatePageText,
  normalizeIndex,
  pageSpaceSize,
} from '../page';
import { findText } from '../search';
import { forwardFeistel, inverseFeistel, pseudoDigitsFromIndex, pseudoIndexFromDigits } from '../pseudo';
import { toDigits } from '../bigint';

const alphabet = buildAlphabet(['ru', 'space', 'punctuation']);
const N = alphabet.length;

describe('pseudo-random layer', () => {
  it('is a permutation: forward(inverse(digits)) === digits', () => {
    const digits = new Uint16Array(PAGE_LENGTH);
    for (let i = 0; i < digits.length; i++) digits[i] = (i * 37 + 11) % N;
    const mixed = forwardFeistel(digits, N);
    const restored = inverseFeistel(mixed, N);
    expect(Array.from(restored)).toEqual(Array.from(digits));
  });

  it('maps index -> digits -> index round trip', () => {
    const index = 12345678901234567890n;
    const mixed = pseudoDigitsFromIndex(index, N);
    const back = pseudoIndexFromDigits(mixed, N);
    expect(back).toBe(index);
  });

  it('is deterministic', () => {
    const index = 987654321987654321n;
    expect(generatePageText(index, alphabet, 'pseudo')).toBe(
      generatePageText(index, alphabet, 'pseudo'),
    );
  });

  it('keeps the page length and alphabet membership', () => {
    const page = generatePageText(42n, alphabet, 'pseudo');
    expect(page.length).toBe(PAGE_LENGTH);
    expect(page.split('').every((c) => alphabet.includes(c))).toBe(true);
  });

  it('differs from the traditional rendering for the same address', () => {
    const index = 777n;
    expect(generatePageText(index, alphabet, 'pseudo')).not.toBe(
      generatePageText(index, alphabet, 'traditional'),
    );
  });

  it('makes neighbouring pages overwhelmingly different', () => {
    const a = generatePageText(1000n, alphabet, 'pseudo');
    const b = generatePageText(1001n, alphabet, 'pseudo');
    let diff = 0;
    for (let i = 0; i < PAGE_LENGTH; i++) if (a[i] !== b[i]) diff++;
    expect(diff).toBeGreaterThan(PAGE_LENGTH * 0.5);
  });

  it('does not change the size of the address space', () => {
    expect(pageSpaceSize(alphabet)).toBe(pageSpaceSize(alphabet));
    expect(normalizeIndex(pageSpaceSize(alphabet), alphabet)).toBe(0n);
  });
});

describe('pseudo-random search', () => {
  const phrase = 'Привет, мир!';

  it('guarantees the query really appears on the resulting page', () => {
    const hit = findText(phrase, alphabet, 'pseudo');
    expect(hit.found).toBe(true);
    const page = generatePageText(hit.index, alphabet, 'pseudo');
    for (const position of hit.positions) {
      expect(page.slice(position, position + phrase.length)).toBe(phrase);
    }
  });

  it('is deterministic for the same query, alphabet and mode', () => {
    const first = findText(phrase, alphabet, 'pseudo');
    const second = findText(phrase, alphabet, 'pseudo');
    expect(second.index).toBe(first.index);
    expect(second.positions).toEqual(first.positions);
  });

  it('produces a different page than traditional search for the same query', () => {
    const traditional = findText(phrase, alphabet, 'traditional');
    const pseudo = findText(phrase, alphabet, 'pseudo');
    expect(generatePageText(pseudo.index, alphabet, 'pseudo')).not.toBe(
      generatePageText(traditional.index, alphabet, 'traditional'),
    );
  });

  it('still reports missing characters in pseudo mode', () => {
    const hit = findText('123', buildAlphabet(['ru']), 'pseudo');
    expect(hit.found).toBe(false);
    expect(hit.reason).toBe('missing-chars');
  });
});
