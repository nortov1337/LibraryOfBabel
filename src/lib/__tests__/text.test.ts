import { describe, expect, it } from 'vitest';
import {
  buildAlphabet,
  characterNameKey,
  characterSymbol,
  codePointLabel,
  describeMissingCharacters,
  findUnknownCharacters,
  groupsForCharacter,
} from '../alphabet';
import { buildSegments, findAllMatches, toggleRange, wordRangeAt } from '../text';

describe('findUnknownCharacters', () => {
  it('returns unique characters in first-appearance order', () => {
    const ru = buildAlphabet(['ru', 'space']);
    expect(findUnknownCharacters('тест 123 тест 123', ru)).toEqual(['1', '2', '3']);
  });

  it('preserves first-appearance order (not sorted)', () => {
    const ru = buildAlphabet(['ru', 'space', 'punctuation']);
    expect(findUnknownCharacters('Привет 5x5 = 25', ru)).toEqual(['5', 'x', '=', '2']);
  });

  it('handles Unicode code points, not UTF-16 units', () => {
    const ru = buildAlphabet(['ru', 'space']);
    expect(findUnknownCharacters('😀', ru)).toEqual(['😀']);
  });

  it('returns nothing when everything is present', () => {
    const ru = buildAlphabet(['ru', 'space', 'punctuation']);
    expect(findUnknownCharacters('Привет, мир!', ru)).toEqual([]);
  });
});

describe('character labels', () => {
  it('makes invisible characters visible with a translation key', () => {
    expect(characterSymbol(' ')).toBe('␠');
    expect(characterNameKey(' ')).toBe('missing.space');
    expect(characterSymbol('\n')).toBe('↵');
    expect(characterNameKey('\n')).toBe('missing.newline');
    expect(characterSymbol('\t')).toBe('⇥');
    expect(characterNameKey('\t')).toBe('missing.tab');
    expect(characterSymbol('\r')).toBe('␍');
    expect(characterNameKey('\r')).toBe('missing.cr');
    expect(characterSymbol('\u0001')).toBe('U+0001');
    expect(characterNameKey('\u0001')).toBeUndefined();
  });

  it('shows normal characters directly', () => {
    expect(characterSymbol('ё')).toBe('ё');
    expect(characterSymbol('@')).toBe('@');
    expect(characterNameKey('ё')).toBeUndefined();
  });

  it('formats Unicode code points', () => {
    expect(codePointLabel('ё')).toBe('U+0451');
    expect(codePointLabel('😀')).toBe('U+1F600');
  });
});

describe('describeMissingCharacters', () => {
  it('reports labels, code points and enabling groups', () => {
    const ru = buildAlphabet(['ru', 'space', 'punctuation']);
    const missing = describeMissingCharacters('Привет 123!', ru);
    expect(missing.map((c) => c.char)).toEqual(['1', '2', '3']);
    expect(missing[0].symbol).toBe('1');
    expect(missing[0].nameKey).toBeUndefined();
    expect(missing[0].codePoint).toBe('U+0031');
    expect(missing[0].groups).toContain('digits');
  });

  it('reports characters that no group can add', () => {
    const ru = buildAlphabet(['ru']);
    const missing = describeMissingCharacters('😀', ru);
    expect(missing[0].groups).toEqual([]);
    expect(missing[0].codePoint).toBe('U+1F600');
  });

  it('maps groups correctly', () => {
    expect(groupsForCharacter('1')).toContain('digits');
    expect(groupsForCharacter('a')).toContain('en');
    expect(groupsForCharacter('@')).toContain('special');
    expect(groupsForCharacter('😀')).toEqual([]);
  });
});

describe('findAllMatches', () => {
  it('finds overlapping matches', () => {
    expect(findAllMatches('aaaaa', 'aa')).toEqual([0, 1, 2, 3]);
  });

  it('returns nothing for an empty query', () => {
    expect(findAllMatches('abc', '')).toEqual([]);
  });
});

describe('wordRangeAt', () => {
  const text = 'в библиотеке существует огромное количество';

  it('selects the whole word under the cursor', () => {
    const offset = text.indexOf('огромное') + 3;
    expect(wordRangeAt(text, offset)).toEqual({
      start: text.indexOf('огромное'),
      end: text.indexOf('огромное') + 'огромное'.length,
    });
  });

  it('includes attached punctuation in the token', () => {
    expect(wordRangeAt('мир!', 3)).toEqual({ start: 0, end: 4 });
  });

  it('returns null on whitespace', () => {
    expect(wordRangeAt(text, text.indexOf(' '))).toBeNull();
  });
});

describe('buildSegments', () => {
  it('tags search and click highlights and preserves the text', () => {
    const text = 'hello world hello';
    const segments = buildSegments(
      text,
      { query: 'hello', matches: [0, 12], active: 1 },
      [{ start: 6, end: 11 }],
    );
    const rebuilt = segments.map((s) => s.text).join('');
    expect(rebuilt).toBe(text);

    const kinds = segments.map((s) => s.kind);
    expect(kinds).toContain('search');
    expect(kinds).toContain('search-active');
    expect(kinds).toContain('click');
    expect(kinds).toContain('plain');
  });
});

describe('toggleRange', () => {
  it('adds and removes ranges', () => {
    const range = { start: 2, end: 5 };
    const added = toggleRange([], range);
    expect(added).toEqual([range]);
    expect(toggleRange(added, range)).toEqual([]);
  });
});
