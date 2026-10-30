# Library of Babel

A browser-based implementation of a **mathematically addressable library** — the space of all possible texts of a fixed length over a configurable alphabet. Every page contains exactly **6400 characters**, and its content is deterministically derived from the numeric page index encoded in the URL address. Pages are never stored in a database: they are computed on demand, and the same address with the same alphabet and generation mode always yields exactly the same text.

The project implements two independent ways of rendering the same address space: **Traditional** (a positional algorithm, the original implementation) and **Pseudo-Random** (a deterministic reversible shuffling layer based on a seed). Both modes use the same number of pages (`N^6400`); only the mapping from an index to characters differs.

> On scale: with a fixed alphabet and page length the library is finite, but astronomically large (`N^6400`). It can be called "infinite" only in a colloquial sense.

## Features

- **Fixed page length** — exactly `6400` characters.
- **Page addressing** — a page is identified by a numeric index encoded as a Base64URL string.
- **Two generation modes** — `traditional` (positional base-N) and `pseudo` (deterministic reversible PRNG shuffling).
- **Deterministic generation** — one address + one mode + one alphabet ⇒ the same page.
- **Random page** — picks a uniformly random index via the platform's CSPRNG (never for content).
- **Previous / Next** — move to the adjacent index (wrapping around the space).
- **Go To** — open a page by address or by decimal index.
- **Find Text** — mathematically constructs a page containing the query; no page enumeration.
- **Match highlighting** — the match is physically highlighted inside the page, with `1 / N` navigation between occurrences (`Previous match` / `Next match`).
- **Click-to-select words** — clicking a token highlights it; clicking again removes the highlight; multiple selections are supported.
- **Custom alphabets** — six character groups (Cyrillic, Latin, digits, space and line feed, punctuation, special characters), with **digits optional**; changing groups recomputes the entire space.
- **Multiline text** — `U+000A` (LF) is a first-class alphabet character, so multiline text can be pasted as a whole; line breaks are preserved, and `\r\n` (Windows) is normalized to `\n`.
- **Bookmarks** — locally saved pages with title, date, preview, alphabet code, and generation mode; open, rename, delete, copy address.
- **Compare** — load two pages with independent addresses *and* generation modes; shows the number of matching/differing characters, the match percentage, and a difference-highlighting mode.
- **Library statistics** — alphabet size, page length, `N^6400` and its scientific approximation, digit count, current address/index, and generation mode.
- **Text → Page** — paste up to 6400 characters and find them in the library.
- **URL sharing** — the Share button copies a URL that fully restores the address, alphabet, display mode, and generation mode.
- **Command Palette** — a searchable command palette (`Ctrl/Cmd + K`).
- **Themes** — System, Dark, Light, Terminal, Minimal, built on CSS tokens.
- **Localization** — English (default) and Russian, including locale-aware formatting of numbers/dates/percentages.
- **Responsive interface** — desktop, laptop, tablet, and mobile.
- **About the Library** — a short explanation of the concept and its limits right in the UI.
- **Developer / Debug** — alphabet size and code, page length, index, encoded/decoded index, a reversibility check, and a **Verify Page** button with a SHA-256 checksum.
- **Other UX details** — loading skeletons, toast notifications, copy confirmation, a 404 page, an error boundary, settings persistence, last-session restore, Open Graph / Twitter metadata, and a favicon.

## Generation

Any page is computed from three inputs:

```
text = generate(index, alphabet, mode)
```

where `index ∈ [0, N^L)`, `N = alphabet.length`, `L = PAGE_LENGTH = 6400`, and `mode ∈ {traditional, pseudo}`. Generation never uses `Math.random()`; randomness (the platform's CSPRNG) is used only to *pick* the index for a random page.

### Traditional

Traditional is the original positional algorithm. The page index is written in base `N` as exactly `L` big-endian digits, and each digit selects an alphabet character:

```text
digits = baseN(index, N, L)          // length L, most significant digit first
text   = alphabet[digits[0]] + ... + alphabet[digits[L-1]]
```

Properties:

- It is a bijection between `[0, N^L)` and the set of all texts of length `L` over the alphabet.
- `text → index` is the inverse transformation (Horner's method), used in `pageTextToIndex`.
- Fully stable and backward compatible: existing addresses, bookmarks, and shared links keep working.

### Pseudo-Random

Pseudo-Random mode keeps the **same address/index space** but applies a deterministic reversible permutation `T` to the digit vector before mapping digits to characters:

```text
digits = baseN(index, N, L)
mixed  = T(digits)                   // reversible permutation of (Z_N)^L
text   = alphabet[mixed]
```

`T` is a **4-round Feistel network** over `(Z_N)^L`. Each round splits the block into two halves `(A, B)` and computes:

```text
(A, B) -> ( B, (A + F(B)) mod N )    // element-wise, mod N
```

`F` is a seeded PRNG ("seed mixer") whose seed is hashed from the whole half-block, so a change anywhere in `B` changes all of `F(B)`. A Feistel network is invertible for *any* round function, which gives two important properties:

1. **Avalanche** — adjacent indices produce independently looking pages; they are almost nothing alike.
2. **Constructibility** — to make a page contain a phrase, the desired output digits are built first, then `T⁻¹` is applied. Direct generation reproduces exactly that page, so the phrase is guaranteed to be present.

The key guarantee:

```
one address + one mode + one alphabet = the same page
```

The number of pages does not change (`N^L`); the mode only affects how a page is rendered, not the size of the space.

## Addressing

An address is URL-safe Base64 (Base64URL, no padding) of the **minimal big-endian byte representation** of the page index:

```text
address = base64url( minimalBigEndianBytes(index) )
index   = bigint( base64urlDecode(address) )
```

This is a bijection, so the following equalities hold:

```text
decodeAddress(encodeAddress(i)) === i
encodeAddress(decodeAddress(a)) === a     // canonical form
```

Conceptual pipeline:

```text
Address -> Page Index -> Generation (digits + mode) -> 6400 characters
```

Implementation notes:

- Arithmetic uses **`BigInt`**, because an index can reach `N^6400`.
- Radix conversion is `toDigits` / `fromDigits` (`src/lib/bigint.ts`).
- Base64URL is implemented by hand (`bytesToBase64Url` / `base64UrlToBytes`) and preserves the `-` and `_` characters.
- Addresses are **long by nature**: a page carries `L · log2(N)` bits of information, and the address must carry just as many. It is compact relative to a hex dump, but it is not a short hash — that is the information-theoretic price of exact enumerability (the About panel in the app says the same thing).

## Search

Search is mathematical rather than an enumeration of pages. For a query of length `K`:

1. Validate the query (`K ≤ 6400`, all characters present in the alphabet).
2. Deterministic positions are derived from a hash of the query.
3. The page is filled with a deterministic pseudo-random filler.
4. The query is written into those positions.
5. The page index is output.

The same query, alphabet, and mode always yield the same page and positions. Multiple occurrences (up to `2–5`, depending on the query) are placed deterministically; the UI highlights all occurrences and lets you switch between them.

The modes differ in how the index is obtained (and Pseudo-Random also uses a separate filler stream, which is why its canonical page differs from Traditional):

```text
traditional: index = fromDigits(desiredDigits)
pseudo:      index = fromDigits(inverseFeistel(desiredDigits))
```

In Pseudo-Random mode the constructed page is still reproduced by direct generation, so the query is guaranteed to be present.

Implementation: `src/lib/search.ts`; rendering and highlighting — `src/components/LibrarySearch.tsx` and `src/components/BookView.tsx`.

Limitations:

- Query length is at most 6400 characters.
- Every query character must be present in the current alphabet. If something is missing, the UI shows a list of unique missing characters (with Unicode code points), explains the reason, and offers to enable the groups that contain them. Characters that do not belong to any built-in group cannot be added from the app.
- Characters are compared exactly; there is no case folding. The only normalization is line endings: `\r\n` and a lone `\r` become `\n`, which belongs to the `space` group.

## URL format

Routes are defined in `src/App.tsx`:

```text
/                     -> restore the last session or open a random page
/book/:address        -> view a page
*                     -> 404
```

A page URL looks like this:

```text
/book/<address>?a=<alphabetCode>&m=<displayMode>&g=<generationMode>[&p=<position>&q=<query>]
```

Real examples (index `0` with the default alphabet, whose code is `19`):

```text
/book/AA?a=19&m=book&g=traditional
/book/AA?a=19&m=book&g=pseudo
```

Query parameters (`src/lib/url.ts`):

| Parameter | Meaning                     | Allowed values                               |
| --------- | --------------------------- | -------------------------------------------- |
| `a`       | Alphabet configuration      | Hex bitmask of enabled groups, e.g. `19`     |
| `m`       | Page display mode           | `book` \| `terminal` \| `minimal`            |
| `g`       | Generation mode             | `traditional` \| `pseudo`                    |
| `p`       | Highlight position          | Integer character offset (from search)       |
| `q`       | Highlight query             | The searched text (from search)              |

- The **address** lives in the path (`:address`) and is encoded as Base64URL.
- The **generation mode** is always written as `g` whenever the app builds a URL (navigation and Share), so a shared link unambiguously restores the mode. Priority: `URL g → saved setting → default (traditional)`.
- The **alphabet configuration** is a compact hex bitmask (`encodeAlphabet` / `decodeAlphabet`). Group order and bit values:

  | Group            | ID            | Bit  | Default |
  | ---------------- | ------------- | ---- | ------- |
  | Cyrillic         | `ru`          | 0x01 | on      |
  | Latin            | `en`          | 0x02 | off     |
  | Digits           | `digits`      | 0x04 | off     |
  | Space and LF     | `space`       | 0x08 | on      |
  | Punctuation      | `punctuation` | 0x10 | on      |
  | Special          | `special`     | 0x20 | off     |

  Default code: `0x01 | 0x08 | 0x10 = 0x19`, which gives `N = 88` (the `space` group contains the space `U+0020` and the line feed `U+000A`).

- **Long addresses** are supported in URLs without truncation; only the on-screen display is shortened (hover tooltip, expand toggle, and a Copy Address button). A regression fixture with a real address about 6,500 characters long lives in `src/lib/__tests__/fixtures.ts`.
- **After F5 / direct navigation** the app re-reads the path and parameters, generates the page from the address, and restores the alphabet, display mode, and generation mode. Missing parameters fall back to saved settings and defaults.

## Themes

Available themes (`Settings → Theme`): `system`, `dark`, `light`, `terminal`, `minimal`.

- The theme is stored in `localStorage` and applied before the first paint by a small inline script in `index.html`, so there is no flash.
- `system` follows `prefers-color-scheme` and reacts to changes.
- All colors come from a single set of **CSS design tokens** defined per theme in `src/index.css` (`:root` / `[data-theme='dark'|'light'|'terminal'|'minimal']`). Components use Tailwind utilities bound to these variables (`theme.extend.colors.app.*` in `tailwind.config.js`); literal black/white appears only on the fixed "paper"/"terminal" page surfaces — deliberately.
- The page surface follows the derived display mode (`book`, `terminal`, `minimal`).

## Localization

Languages: **English (default)** and **Russian**.

- Dictionaries and the translator live in `src/lib/i18n.ts`; `en` is the canonical dictionary, and `ru` must cover exactly the same keys (enforced by the `Record<TranslationKey, string>` type).
- Components call `t(key, params)`; user-facing strings are not hardcoded.
- Locale-aware formatting uses `Intl.NumberFormat` / `Intl.DateTimeFormat` (for example, `6,400` vs `6 400`) according to the active language.
- The language is stored in settings and reflected in `<html lang>`.

## Keyboard shortcuts

| Shortcut             | Action                                                       |
| -------------------- | ------------------------------------------------------------ |
| `Ctrl + K` / `Cmd+K` | Open / close the Command Palette                             |
| `Ctrl + S` / `Cmd+S` | Save the current page to bookmarks                           |
| `Ctrl + C` / `Cmd+C` | Copy the page text (only when nothing is selected)           |
| `/`                  | Move focus to the search field                               |
| `R`                  | Random page                                                  |
| `←`                  | Previous page                                                |
| `→`                  | Next page                                                    |

Shortcuts do not fire while typing in `input`, `textarea`, or editable elements (`Ctrl/Cmd + K` works globally). Implementation: `src/hooks/useHotkeys.ts`.

## Architecture

```text
LibraryOfBabel/
├── index.html                     # HTML shell, theme/language bootstrap, SEO/OG meta
├── package.json
├── vite.config.ts                 # Vite + Vitest config (ESM worker format)
├── tsconfig.json
├── tailwind.config.js             # Tailwind + `app` design-token palette
├── postcss.config.js
├── public/
│   ├── favicon.svg
│   └── og.svg
└── src/
    ├── main.tsx                   # React entry point
    ├── App.tsx                    # router + providers + error boundary
    ├── index.css                  # theme tokens, component classes, page surfaces
    ├── components/
    │   ├── Shell.tsx              # header, navigation, layout, panel mounting
    │   ├── BookView.tsx           # main page: address, navigation, surface, word selection
    │   ├── LibrarySearch.tsx      # inline/panel search + missing-character state
    │   ├── GenerationModeToggle.tsx
    │   ├── CommandPalette.tsx
    │   ├── Modal.tsx              # SlideOver + centered Modal
    │   ├── Toasts.tsx
    │   ├── Skeleton.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── icons.tsx
    │   └── panels/
    │       ├── SearchPanel.tsx    # Text → Page (slide-over)
    │       ├── BookmarksPanel.tsx
    │       ├── ComparePanel.tsx
    │       ├── StatsPanel.tsx
    │       ├── SettingsPanel.tsx
    │       ├── DebugPanel.tsx
    │       └── AboutModal.tsx
    ├── hooks/
    │   └── useHotkeys.ts
    ├── lib/                       # UI-independent, unit-tested core
    │   ├── constants.ts           # PAGE_LENGTH = 6400
    │   ├── bigint.ts              # pow, BigInt <-> digits, Base64URL, CSPRNG index
    │   ├── alphabet.ts            # groups, buildAlphabet, bitmask codec, missing characters
    │   ├── address.ts             # address encode/decode (bijection), shortAddress
    │   ├── page.ts                # generatePageText, pageTextToIndex, verifyPage
    │   ├── pseudo.ts              # Feistel shuffling (forward/inverse)
    │   ├── search.ts              # mathematical findText
    │   ├── compare.ts             # page comparison
    │   ├── text.ts                # matches, word selection, highlight segments
    │   ├── settings.ts            # settings + last-session persistence
    │   ├── bookmarks.ts           # bookmarks in localStorage
    │   ├── url.ts                 # build/parse URL state
    │   ├── i18n.ts                # en/ru dictionaries + Intl formatters
    │   ├── format.ts              # numeric helpers (scientific notation, grouping)
    │   ├── clipboard.ts           # clipboard with fallback
    │   ├── engine.ts              # worker client with synchronous fallback
    │   └── __tests__/
    │       ├── core.test.ts
    │       ├── pseudo.test.ts
    │       ├── text.test.ts
    │       └── fixtures.ts        # fixture with a long real address
    ├── pages/
    │   ├── HomeRedirect.tsx       # `/` -> last session or random page
    │   ├── LibraryPage.tsx
    │   └── NotFound.tsx
    ├── state/
    │   ├── LibraryContext.tsx     # central state (page, search, settings, i18n)
    │   └── ToastContext.tsx
    └── workers/
        └── library.worker.ts      # generation/search off the main thread
```

Key points:

- The `src/lib` core is pure and independent of React, so it is tested directly.
- `LibraryContext` is the single source of truth for the current page, search state, settings, and localization; the effective state is derived from the URL (address path + query parameters).
- Heavy BigInt work runs in a **Web Worker** module (`src/workers/library.worker.ts`) via `engine`; if the Worker is unavailable, the same synchronous code is used, so behavior is identical.

## Tech stack

| Area          | Choice                                                        |
| ------------- | ------------------------------------------------------------- |
| Framework     | React `^18.3.1`                                               |
| Language      | TypeScript `^5.5.4`                                           |
| Build         | Vite `^5.4.3` (`@vitejs/plugin-react ^4.3.1`)                 |
| Styling       | Tailwind CSS `^3.4.10` + CSS variables (design tokens)        |
| Routing       | react-router-dom `^6.26.2` (BrowserRouter)                    |
| State         | React Context (`LibraryContext`, `ToastContext`)              |
| Workers       | Vite module worker format (`worker.format: 'es'`)             |
| Tests         | Vitest `^2.0.5`, `@testing-library/react ^16.3.3`, jsdom      |
| Database      | None — no backend; pages are computed, not stored             |

## Development

Node.js and npm are required.

```bash
git clone <repository-url>
cd LibraryOfBabel
npm install
npm run dev
```

Available scripts (from `package.json`):

| Command             | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                                 |
| `npm run build`     | Type-check (`tsc --noEmit`) and build for production      |
| `npm run preview`   | Serve the built `dist/` locally                           |
| `npm run test`      | Run Vitest in watch mode                                  |
| `npm run test:run`  | Run the tests once                                        |
| `npm run typecheck` | Type-check only (`tsc --noEmit`)                          |

There is no separate lint script in the project.

## Production

```bash
npm run build     # output in dist/
npm run preview   # serve the production build locally
```

`dist/` is a static bundle that can be hosted on any static hosting. Because the app uses `BrowserRouter`, the host must be configured with an **SPA fallback** — rewriting unknown paths (for example, a direct visit to `/book/<address>`) to `index.html`. `vite preview` already provides this fallback.

## Determinism

Determinism is the central property of the project:

> The same address with the same configuration must always lead to the same result.

The result depends on exactly three inputs, and all of them are reproducible:

```text
page = generate(index, alphabet, mode)
  index    = decodeAddress(address)     // from the URL path
  alphabet = buildAlphabet(groups)      // from the `a` code in the URL / saved settings
  mode     = traditional | pseudo       // from `g` in the URL / saved settings
```

A conceptual example:

```text
/book/AA?a=19&m=book&g=traditional
  -> index 0, default alphabet (N = 88), Traditional
  -> always the same 6400-character page for any user

/book/AA?a=19&m=book&g=pseudo
  -> index 0, default alphabet (N = 88), Pseudo-Random
  -> a different page, but equally stable for any user
```

Page content does not depend on `Math.random()`, time, or session state. The `Verify Page` action in the Debug panel regenerates the page from the index and compares the result (and shows a SHA-256 checksum).

## Design philosophy

- **Pages are not stored.** There is no page database and no precomputed corpus; the whole library is represented by a formula, not by data.
- **The space is addressed mathematically.** A page is a number in `[0, N^6400)`; Base64URL is merely the URL-compatible encoding of that number. Navigation, sharing, and search all reduce to arithmetic.
- **Generation is reproducible.** Given the address and the configuration, anyone can compute the same page. That is exactly what makes sharing meaningful without a server.
- **The address is the page's identity.** The generation mode is part of the URL, so a single address can be unambiguously opened in any of the modes, and a copied address renders identically for another user.

## Limitations

- **Addresses are long.** A page contains `6400 · log2(N)` bits, so an address carries just as much data and can reach thousands of characters. There is no URL shortener (no backend); very long URLs may run into proxy/hosting limits.
- **Search is bounded by the alphabet.** A query is at most 6400 characters long, and every character must be present in the current alphabet. Missing characters are shown; characters that do not belong to any built-in group cannot be added from the UI.
- **Pseudo-Random is not cryptographic.** The shuffling layer is a deterministic reversible permutation intended for visual variety, not for security.
- **`Verify Page` (checksum) requires a secure context.** The SHA-256 checksum uses `crypto.subtle`, which is available only over HTTPS (or `localhost`). Without it, the verify action reports an error.
- **Storage is local.** Settings, bookmarks, and the last session are stored in `localStorage`; clearing site data resets them, and there is no cross-device sync.
- **Two languages.** Only English and Russian are implemented.
- **An SPA fallback is required.** Direct links depend on the host rewriting unknown routes to `index.html` (see [Production](#production)).
- **No curation.** The library is a mathematical model: it contains all possible texts, but meaningful strings are not "collected" — they are found deterministically through Search. On random browsing, readable text practically never appears.
- **Built-in alphabet groups are fixed.** Arbitrary character sets beyond the six predefined groups are not supported.

## License

There is no license file in the repository as of this writing, so the license is currently **undefined**. Add a license before distributing or reusing the project.
