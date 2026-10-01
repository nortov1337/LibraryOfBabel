// @vitest-environment jsdom
import { afterEach, describe, expect, it, beforeEach } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { encodeAddress } from './lib/address';
import { buildAlphabet, encodeAlphabet } from './lib/alphabet';
import { generatePageText, PAGE_LENGTH } from './lib/page';
import { wordRangeAt } from './lib/text';
import { LONG_ADDRESS } from './lib/__tests__/fixtures';
import App from './App';

const groups = ['ru', 'space', 'punctuation'] as const;
const alphabet = buildAlphabet([...groups]);
const code = encodeAlphabet([...groups]);

function pageText(container: HTMLElement): string {
  return container.querySelector('#babel-page-text')?.textContent ?? '';
}

/** Build a DOM Range whose caret offset maps to `offset` inside `root`. */
function rangeAtOffset(root: Node, offset: number): Range {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (offset <= total + length) {
      const range = document.createRange();
      range.setStart(node, Math.min(offset - total, length));
      range.setEnd(node, Math.min(offset - total, length));
      return range;
    }
    total += length;
    node = walker.nextNode();
  }
  const range = document.createRange();
  range.selectNodeContents(root);
  return range;
}

async function renderAt(index: bigint): Promise<HTMLElement> {
  window.history.replaceState(null, '', `/book/${encodeAddress(index)}?a=${code}&m=book`);
  const { container } = render(<App />);
  await waitFor(() => expect(pageText(container).length).toBe(PAGE_LENGTH), { timeout: 8000 });
  return container as HTMLElement;
}

describe('App (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    document.documentElement.lang = 'en';
    document.documentElement.dataset.theme = 'dark';
  });

  afterEach(() => {
    cleanup();
  });

  it('restores a page from the URL and renders exactly 6400 characters', async () => {
    const index = 987654321987654321n;
    const expected = generatePageText(index, alphabet);
    const container = await renderAt(index);
    expect(pageText(container)).toBe(expected);
  });

  it('shows the brand and navigation controls (English by default)', () => {
    window.history.replaceState(null, '', `/book/${encodeAddress(0n)}?a=${code}&m=book`);
    render(<App />);
    expect(document.body.textContent).toContain('LIBRARY');
    expect(screen.getByRole('button', { name: /^random$/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /previous/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /next/i })).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });

  it('navigates to the next page and updates the URL', async () => {
    const start = 5000n;
    const container = await renderAt(start);
    const before = pageText(container);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(window.location.pathname).toContain(encodeAddress(start + 1n)));
    await waitFor(() => expect(pageText(container)).not.toBe(before));
  });

  it('searches from the main page and physically highlights the phrase', async () => {
    const container = await renderAt(0n);

    const input = screen.getByPlaceholderText(/enter text/i);
    fireEvent.change(input, { target: { value: 'Привет, мир!' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(
      () => {
        const marks = container.querySelectorAll('mark.babel-hit-search');
        expect(marks.length).toBeGreaterThan(0);
        expect(Array.from(marks).some((m) => m.textContent === 'Привет, мир!')).toBe(true);
      },
      { timeout: 5000 },
    );

    expect(container.textContent).toMatch(/1 \/ \d+/);
    expect(container.textContent).toMatch(/Next match/i);
  });

  it('shows concrete, unique missing characters and lets the user enable them', async () => {
    await renderAt(0n);

    const input = screen.getByPlaceholderText(/enter text/i);
    fireEvent.change(input, { target: { value: 'тест 123 тест 123' } });

    await waitFor(() => {
      expect(document.body.textContent).toContain('Missing characters: 3');
    });
    expect(screen.getAllByText('U+0031')).toHaveLength(1);
    expect(screen.getAllByText('U+0032')).toHaveLength(1);
    expect(screen.getAllByText('U+0033')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /enable numbers/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /enable missing characters/i }));

    await waitFor(() => {
      expect(document.body.textContent).toContain('all characters available');
    });
  });

  it('highlights a word on click and toggles it off on a second click', async () => {
    const container = await renderAt(0n);
    const pageElement = container.querySelector('.page-text') as HTMLElement;
    const text = pageElement.textContent ?? '';

    let offset = 0;
    while (offset < text.length && /\s/.test(text[offset])) offset++;
    const tokenRange = wordRangeAt(text, offset);
    expect(tokenRange).not.toBeNull();
    const token = text.slice(tokenRange!.start, tokenRange!.end);

    (document as unknown as { caretRangeFromPoint: () => Range }).caretRangeFromPoint = () =>
      rangeAtOffset(pageElement, offset);

    fireEvent.click(pageElement, { button: 0, clientX: 5, clientY: 5 });

    await waitFor(() => {
      const mark = pageElement.querySelector('mark.babel-hit-click');
      expect(mark).not.toBeNull();
      expect(mark?.textContent).toBe(token);
    });

    fireEvent.click(pageElement, { button: 0, clientX: 5, clientY: 5 });
    await waitFor(() => {
      expect(pageElement.querySelector('mark.babel-hit-click')).toBeNull();
    });
  });

  it('switches theme and persists it across reloads', async () => {
    await renderAt(0n);

    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /^terminal$/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('terminal');
    });

    cleanup();
    await renderAt(0n);

    expect(document.documentElement.dataset.theme).toBe('terminal');
  });

  it('switches language, translates the UI and persists it across reloads', async () => {
    await renderAt(0n);
    expect(document.documentElement.lang).toBe('en');
    expect(document.body.textContent).toContain('Search the Library');

    fireEvent.click(screen.getByRole('button', { name: /language/i }));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('ru');
    });
    expect(document.body.textContent).toContain('Поиск по библиотеке');
    expect(document.body.textContent).toContain('Случайная');

    cleanup();
    await renderAt(0n);

    expect(document.documentElement.lang).toBe('ru');
    expect(document.body.textContent).toContain('Поиск по библиотеке');
  });

  it('saves a page to bookmarks', async () => {
    await renderAt(123n);

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(saveButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /^bookmarks$/i }));

    await waitFor(() => {
      expect(document.body.textContent).toContain('Saved pages: 1');
    });
  });

  it('toggles optional digits and recalculates the alphabet', async () => {
    await renderAt(0n);

    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(document.body.textContent).toContain(`N = ${alphabet.length}`);

    fireEvent.click(screen.getByRole('button', { name: /digits 0–9/i }));

    await waitFor(() => {
      expect(document.body.textContent).toContain(`N = ${alphabet.length + 10}`);
    });
    expect(decodeURIComponent(window.location.search)).toContain(
      `a=${encodeAlphabet([...groups, 'digits'])}`,
    );
  });

  it('toggles generation mode, updates the URL and re-renders without reload', async () => {
    const container = await renderAt(0n);
    const traditional = pageText(container);

    fireEvent.click(screen.getByRole('button', { name: /pseudo-random/i }));

    await waitFor(() => expect(decodeURIComponent(window.location.search)).toContain('g=pseudo'));
    await waitFor(() => expect(pageText(container)).not.toBe(traditional));
    expect(pageText(container).length).toBe(PAGE_LENGTH);
    // The page index (address) must not change when only the mode changes.
    expect(window.location.pathname).toContain(encodeAddress(0n));

    fireEvent.click(screen.getByRole('button', { name: /^traditional$/i }));
    await waitFor(() => expect(pageText(container)).toBe(traditional));
  });

  it('opens a pseudo-random page directly and reproduces it after reload', async () => {
    const index = 424242n;
    const expected = generatePageText(index, alphabet, 'pseudo');
    const url = `/book/${encodeAddress(index)}?a=${code}&m=book&g=pseudo`;

    window.history.replaceState(null, '', url);
    const { container } = render(<App />);
    await waitFor(() => expect(pageText(container)).toBe(expected), { timeout: 8000 });
    expect(decodeURIComponent(window.location.search)).toContain('g=pseudo');

    cleanup();
    window.history.replaceState(null, '', url);
    const second = render(<App />);
    await waitFor(() => expect(pageText(second.container)).toBe(expected), { timeout: 8000 });
  });

  it('stores the generation mode in bookmarks', async () => {
    window.history.replaceState(null, '', `/book/${encodeAddress(55n)}?a=${code}&m=book&g=pseudo`);
    render(<App />);
    await waitFor(() => expect(document.body.textContent).toContain('LIBRARY'));

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(saveButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /^bookmarks$/i }));

    await waitFor(() => {
      expect(document.body.textContent).toContain('Saved pages: 1');
      expect(document.body.textContent).toContain('Pseudo-Random');
    });
  });

  it('opens a very long address directly, preserves it in the URL and survives reload', async () => {
    window.history.replaceState(null, '', `/book/${LONG_ADDRESS}?a=${code}&m=book`);
    const { container } = render(<App />);

    await waitFor(() => expect(pageText(container).length).toBe(PAGE_LENGTH), { timeout: 10000 });

    // The exact address must remain in the URL, including "-" and "_".
    expect(window.location.pathname).toContain(LONG_ADDRESS);
    expect(window.location.pathname).toContain('-');
    expect(window.location.pathname).toContain('_');

    cleanup();
    window.history.replaceState(null, '', `/book/${LONG_ADDRESS}?a=${code}&m=book`);
    const second = render(<App />);
    await waitFor(() => expect(pageText(second.container).length).toBe(PAGE_LENGTH), {
      timeout: 10000,
    });
    expect(window.location.pathname).toContain(LONG_ADDRESS);
  });
});
