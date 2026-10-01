import { describe, expect, it } from 'vitest';
import {
  buildAlphabet,
  countDigits,
  decodeAlphabet,
  encodeAlphabet,
  GROUPS,
  type GroupId,
} from '../alphabet';
import { encodeAddress, decodeAddress } from '../address';
import {
  PAGE_LENGTH,
  generatePageText,
  normalizeIndex,
  pageSpaceSize,
  pageTextToIndex,
  validatePage,
} from '../page';
import { findText } from '../search';
import { comparePages } from '../compare';
import { buildQuery, parseQuery } from '../url';
import { LONG_ADDRESS } from './fixtures';

const DEFAULT: GroupId[] = ['ru', 'space', 'punctuation'];
const alphabet = buildAlphabet(DEFAULT);

describe('page generation (determinism)', () => {
  it('same index + alphabet always yields the same page', () => {
    const index = 123456789n;
    const a = generatePageText(index, alphabet);
    const b = generatePageText(index, alphabet);
    expect(a).toBe(b);
  });

  it('page always has exactly 6400 characters', () => {
    for (const idx of [0n, 1n, 999999999999n, pageSpaceSize(alphabet) - 1n]) {
      const text = generatePageText(idx, alphabet);
      expect(text.length).toBe(PAGE_LENGTH);
    }
  });

  it('every page character belongs to the alphabet', () => {
    const text = generatePageText(987654321987654321n, alphabet);
    const validation = validatePage(text, alphabet);
    expect(validation.valid).toBe(true);
    expect(validation.unknown).toEqual([]);
  });

  it('different indices give different pages', () => {
    const a = generatePageText(1n, alphabet);
    const b = generatePageText(2n, alphabet);
    expect(a).not.toBe(b);
  });
});

describe('index <-> text', () => {
  it('text -> index -> text round trips', () => {
    const index = 424242424242424242n;
    const text = generatePageText(index, alphabet);
    expect(pageTextToIndex(text, alphabet)).toBe(index);
  });

  it('index -> text -> index round trips', () => {
    const text = generatePageText(7n, alphabet);
    expect(generatePageText(pageTextToIndex(text, alphabet), alphabet)).toBe(text);
  });
});

describe('address encoding', () => {
  it('encode -> decode returns the original index', () => {
    for (const index of [0n, 1n, 255n, 256n, 2n ** 200n, 123456789012345678901234567890n]) {
      expect(decodeAddress(encodeAddress(index))).toBe(index);
    }
  });

  it('decode -> encode returns the original address', () => {
    const index = 2n ** 512n + 12345n;
    const address = encodeAddress(index);
    expect(encodeAddress(decodeAddress(address))).toBe(address);
  });

  it('different indices never share an address', () => {
    const seen = new Set<string>();
    for (let i = 0n; i < 500n; i++) {
      const address = encodeAddress(i);
      expect(seen.has(address)).toBe(false);
      seen.add(address);
    }
  });

  it('round-trips the provided very long address without changes', () => {
    const index = decodeAddress(LONG_ADDRESS);
    expect(encodeAddress(index)).toBe(LONG_ADDRESS);
    // base64url specific characters must survive untouched
    expect(LONG_ADDRESS).toMatch(/-/);
    expect(LONG_ADDRESS).toMatch(/_/);
  });
});

describe('previous / next navigation', () => {
  it('next increments the index by one (wrapping at the end)', () => {
    const space = pageSpaceSize(alphabet);
    const index = 1000n;
    expect(normalizeIndex(index + 1n, alphabet)).toBe(index + 1n);
    expect(normalizeIndex(space, alphabet)).toBe(0n);
  });

  it('previous decrements the index by one (wrapping at zero)', () => {
    const space = pageSpaceSize(alphabet);
    expect(normalizeIndex(0n - 1n, alphabet)).toBe(space - 1n);
  });
});

describe('alphabet changes', () => {
  it('adding a group changes the space size', () => {
    const base = buildAlphabet(['ru']);
    const withDigits = buildAlphabet(['ru', 'digits']);
    expect(withDigits.length).toBe(base.length + 10);
    expect(pageSpaceSize(withDigits)).not.toBe(pageSpaceSize(base));
  });

  it('same index yields different content under different alphabets', () => {
    const a = buildAlphabet(['ru', 'space']);
    const b = buildAlphabet(['ru', 'space', 'digits']);
    const index = 123456789012345678901234567890n;
    expect(generatePageText(index, a)).not.toBe(generatePageText(index, b));
  });
});

describe('optional digits', () => {
  it('digits can be toggled on and off', () => {
    const off = buildAlphabet(DEFAULT);
    const on = buildAlphabet([...DEFAULT, 'digits']);
    expect(countDigits(off)).toBe(0);
    expect(countDigits(on)).toBe(10);
  });
});

describe('alphabet codec', () => {
  it('encodes and decodes group sets', () => {
    for (const groups of GROUPS.map((g) => [g.id] as GroupId[]).concat([DEFAULT, ['ru', 'digits', 'special']])) {
      expect(decodeAlphabet(encodeAlphabet(groups)).sort()).toEqual([...groups].sort());
    }
  });

  it('falls back to defaults for invalid codes', () => {
    expect(decodeAlphabet('zz')).toEqual(['ru', 'space', 'punctuation']);
    expect(decodeAlphabet(undefined).length).toBeGreaterThan(0);
  });
});

describe('URL state', () => {
  it('round trips book state (including generation mode)', () => {
    const query = buildQuery({
      alphabetCode: '7',
      mode: 'terminal',
      generationMode: 'pseudo',
      position: 1837,
      query: 'Привет, мир!',
    });
    const parsed = parseQuery(query.startsWith('?') ? query : `?${query}`);
    expect(parsed.a).toBe('7');
    expect(parsed.m).toBe('terminal');
    expect(parsed.g).toBe('pseudo');
    expect(parsed.p).toBe(1837);
    expect(parsed.q).toBe('Привет, мир!');
  });
});

describe('search', () => {
  it('locates any phrase that fits the alphabet at a deterministic position', () => {
    const phrase = 'Привет, мир!';
    const hit = findText(phrase, alphabet);
    expect(hit.found).toBe(true);
    const again = findText(phrase, alphabet);
    expect(again.position).toBe(hit.position);
    expect(again.index).toBe(hit.index);

    const page = generatePageText(hit.index, alphabet);
    expect(page.slice(hit.position, hit.position + phrase.length)).toBe(phrase);
  });

  it('places several deterministic, real occurrences of the query', () => {
    const phrase = 'Привет, мир!';
    const hit = findText(phrase, alphabet);
    expect(hit.positions.length).toBeGreaterThanOrEqual(1);

    const page = generatePageText(hit.index, alphabet);
    for (const position of hit.positions) {
      expect(page.slice(position, position + phrase.length)).toBe(phrase);
    }

    const again = findText(phrase, alphabet);
    expect(again.positions).toEqual(hit.positions);
  });

  it('reports characters missing from the alphabet', () => {
    const hit = findText('Hello 123', buildAlphabet(['ru']));
    expect(hit.found).toBe(false);
    expect(hit.reason).toBe('missing-chars');
    expect(hit.missing.length).toBeGreaterThan(0);
  });

  it('rejects queries longer than a page', () => {
    const hit = findText('а'.repeat(PAGE_LENGTH + 1), alphabet);
    expect(hit.found).toBe(false);
    expect(hit.reason).toBe('too-long');
  });
});

describe('compare', () => {
  it('counts equal and differing characters', () => {
    const a = generatePageText(1n, alphabet);
    const b = generatePageText(2n, alphabet);
    const result = comparePages(a, b);
    expect(result.total).toBe(PAGE_LENGTH);
    expect(result.equal + result.different).toBe(PAGE_LENGTH);
    expect(result.matchPercent).toBeGreaterThanOrEqual(0);
    expect(result.matchPercent).toBeLessThanOrEqual(100);
  });

  it('identical pages match 100%', () => {
    const a = generatePageText(5n, alphabet);
    expect(comparePages(a, a).matchPercent).toBe(100);
  });
});
