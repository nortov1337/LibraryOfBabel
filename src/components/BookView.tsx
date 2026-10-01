import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { shortAddress } from '../lib/address';
import { PAGE_LENGTH } from '../lib/page';
import { buildSegments, toggleRange, wordRangeAt, type Range } from '../lib/text';
import type { TranslationKey } from '../lib/i18n';
import { LibrarySearch } from './LibrarySearch';
import { GenerationModeToggle } from './GenerationModeToggle';
import { PageSkeleton } from './Skeleton';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCopy,
  IconDice,
  IconExternal,
  IconSave,
  IconShare,
} from './icons';

function globalTextOffset(root: Node, node: Node, offset: number): number {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) return total + offset;
    total += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }
  return total + offset;
}

function offsetFromPoint(x: number, y: number, container: HTMLElement | null): number | null {
  if (!container) return null;
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };
  let node: Node | null = null;
  let offset = 0;
  if (typeof doc.caretRangeFromPoint === 'function') {
    const domRange = doc.caretRangeFromPoint(x, y);
    if (domRange) {
      node = domRange.startContainer;
      offset = domRange.startOffset;
    }
  } else if (typeof doc.caretPositionFromPoint === 'function') {
    const position = doc.caretPositionFromPoint(x, y);
    if (position) {
      node = position.offsetNode;
      offset = position.offset;
    }
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  return globalTextOffset(container, node, offset);
}

function PageBody({ text }: { text: string }) {
  const { search } = useLibrary();
  const [clickRanges, setClickRanges] = useState<Range[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click highlights are ephemeral: reset them when the page text changes.
  useEffect(() => {
    setClickRanges([]);
  }, [text]);

  const segments = useMemo(
    () => buildSegments(text, search, clickRanges),
    [text, search, clickRanges],
  );

  // Bring the active search match into view.
  useEffect(() => {
    if (!search || search.matches.length === 0) return;
    const element = containerRef.current?.querySelector('[data-active="true"]');
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [search, search?.active, text]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return; // respect native selection
    const offset = offsetFromPoint(event.clientX, event.clientY, containerRef.current);
    if (offset == null) return;
    const range = wordRangeAt(text, offset);
    if (!range) return;
    setClickRanges((current) => toggleRange(current, range));
  };

  return (
    <div ref={containerRef} className="page-text has-highlights" onClick={handleClick}>
      {segments.map((segment) => {
        if (segment.kind === 'plain') {
          return <span key={segment.start}>{segment.text}</span>;
        }
        const isSearch = segment.kind === 'search' || segment.kind === 'search-active';
        const className = isSearch
          ? `babel-hit-search${segment.kind === 'search-active' ? ' is-active' : ''}`
          : 'babel-hit-click';
        return (
          <mark
            key={segment.start}
            className={className}
            data-active={segment.kind === 'search-active' ? 'true' : undefined}
          >
            {segment.text}
          </mark>
        );
      })}
    </div>
  );
}

function PageSurface() {
  const { mode, loading, error, text, address, alphabetCode, generationMode, t } = useLibrary();
  const displayedAddress = useRef(address);

  useEffect(() => {
    if (!loading) displayedAddress.current = address;
  }, [loading, address]);

  // Only collapse to the skeleton when the page itself changes; a mere mode
  // switch keeps the current text (and scroll position) until the new page is
  // ready, then cross-fades via the keyed article below.
  const addressChanged = displayedAddress.current !== address;
  if ((loading && (addressChanged || !text)) || (!text && !error)) return <PageSkeleton />;

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-app-danger">{t(error.key)}</p>
        {error.detail && <p className="mt-1 font-mono text-[11px] text-app-faint">{error.detail}</p>}
        <p className="mt-2 text-xs text-app-faint">{t('page.invalidAddressHint')}</p>
      </div>
    );
  }

  const surfaceClass =
    mode === 'terminal'
      ? 'page-surface page-terminal rounded-2xl border p-5 sm:p-8'
      : mode === 'minimal'
        ? 'page-surface page-minimal px-1 py-2 sm:px-4'
        : 'page-surface page-book rounded-2xl border border-black/10 p-6 sm:p-12';

  return (
    <article
      id="babel-page-text"
      key={`${address}|${alphabetCode}|${generationMode}`}
      className={`${surfaceClass} animate-fade-in`}
      lang="ru"
    >
      <PageBody text={text} />
    </article>
  );
}

function AddressCard() {
  const { address, index, copyAddress, share, saveBookmark, alphabet, t, number } = useLibrary();
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="card mb-5 min-w-0 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="label">{t('page.current')}</p>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            title={address}
            className="mt-1 block max-w-full truncate text-left font-mono text-xs text-app-accent transition hover:underline"
          >
            {shortAddress(address, 18, 12)}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={copyAddress} title={t('page.copyAddress')}>
            <IconCopy width={16} height={16} />
            <span className="hidden sm:inline">{t('page.copyAddressButton')}</span>
          </button>
          <button type="button" className="btn" onClick={share} title={t('page.shareTitle')}>
            <IconShare width={16} height={16} />
            <span className="hidden sm:inline">{t('page.share')}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => saveBookmark()}
            title={t('page.saveTitle')}
          >
            <IconSave width={16} height={16} />
            <span className="hidden sm:inline">{t('page.save')}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 min-w-0 rounded-xl border border-app-border bg-app-surface-2 p-3">
        <div
          className={`font-mono text-[11px] leading-relaxed text-app-muted ${
            expanded ? 'max-h-40 overflow-y-auto break-all' : 'truncate'
          }`}
          title={expanded ? undefined : address}
        >
          {address}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <button
            type="button"
            className="text-[11px] text-app-faint transition hover:text-app-text"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? t('page.collapse') : t('page.showFull', { count: number(address.length) })}
          </button>
          <span className="text-[11px] text-app-faint">
            {t('page.index')}:{' '}
            <span className="font-mono">{shortAddress(index.toString(), 10, 6)}</span> ·{' '}
            {t('page.alphabet')}: {number(alphabet.length)}
          </span>
        </div>
      </div>
    </section>
  );
}

function Navigation() {
  const { random, prev, next, goTo, t } = useLibrary();
  const [value, setValue] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    goTo(value);
    setValue('');
  };

  return (
    <section className="mb-5 flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <button type="button" className="btn" onClick={prev} title={t('page.previousTitle')}>
          <IconArrowLeft width={16} height={16} />
          <span className="hidden sm:inline">{t('page.previous')}</span>
        </button>
        <button type="button" className="btn btn-primary" onClick={random} title={t('page.randomTitle')}>
          <IconDice width={16} height={16} />
          {t('page.random')}
        </button>
        <button type="button" className="btn" onClick={next} title={t('page.nextTitle')}>
          <span className="hidden sm:inline">{t('page.next')}</span>
          <IconArrowRight width={16} height={16} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="input min-w-0 font-mono text-xs"
          placeholder={t('page.goToPlaceholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="btn whitespace-nowrap">
          <IconExternal width={16} height={16} />
          {t('page.open')}
        </button>
      </form>
    </section>
  );
}

function PageFooter() {
  const { text, saveBookmark, mode, t, number } = useLibrary();
  const modeKey = `mode.${mode}` as TranslationKey;

  return (
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="chip font-mono">
          {t('page.charCount', { count: number(text.length), total: number(PAGE_LENGTH) })}
        </span>
        <span className="hidden text-[11px] uppercase tracking-[0.2em] text-app-faint sm:inline">
          {t('page.mode')}: {t(modeKey)}
        </span>
      </div>
      <button type="button" className="btn" onClick={() => saveBookmark()}>
        <IconSave width={16} height={16} />
        {t('common.save')}
      </button>
    </footer>
  );
}

export function BookView() {
  const { t, generationMode, setGenerationMode } = useLibrary();
  const modeTooltip =
    generationMode === 'pseudo'
      ? t('generation.pseudo.tooltip')
      : t('generation.traditional.tooltip');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6">
      <header className="mb-6 text-center animate-fade-up">
        <p className="label">{t('home.kicker')}</p>
        <h1 className="mt-2 font-serif text-4xl tracking-wide text-app-text sm:text-5xl">
          {t('home.title')}
        </h1>
        <p className="mt-2 text-sm text-app-muted">{t('home.subtitle')}</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="label" title={modeTooltip}>
            {t('generation.title')}
          </span>
          <GenerationModeToggle value={generationMode} onChange={setGenerationMode} />
        </div>
      </header>
      <LibrarySearch variant="inline" />
      <AddressCard />
      <Navigation />
      <PageSurface />
      <PageFooter />
    </div>
  );
}
