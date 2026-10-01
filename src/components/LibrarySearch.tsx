import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { engine } from '../lib/engine';
import { PAGE_LENGTH } from '../lib/page';
import { describeMissingCharacters, GROUPS, type GroupId } from '../lib/alphabet';
import { encodeAddress, shortAddress } from '../lib/address';
import type { FindResult } from '../lib/search';
import { IconArrowLeft, IconArrowRight, IconSearch } from './icons';

interface LibrarySearchProps {
  variant?: 'inline' | 'panel';
}

export function LibrarySearch({ variant = 'inline' }: LibrarySearchProps) {
  const {
    alphabet,
    openLocation,
    enableGroups,
    search,
    nextMatch,
    prevMatch,
    searchFocusToken,
    generationMode,
    t,
    number,
  } = useLibrary();

  const inline = variant === 'inline';
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FindResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const firstFocus = useRef(true);

  useEffect(() => {
    if (!inline) return;
    // Skip the initial mount so we do not grab focus (and open the mobile
    // keyboard) on every page load; only react to explicit focus requests.
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    inputRef.current?.focus();
  }, [searchFocusToken, inline]);

  const charCount = Array.from(query).length;
  const tooLong = charCount > PAGE_LENGTH;
  const missing = useMemo(
    () => (query.length > 0 ? describeMissingCharacters(query, alphabet) : []),
    [query, alphabet],
  );

  const missingGroups = useMemo<GroupId[]>(() => {
    const ids = new Set<GroupId>();
    for (const character of missing) for (const id of character.groups) ids.add(id);
    return [...ids];
  }, [missing]);

  const uncovered = useMemo(
    () => missing.filter((character) => character.groups.length === 0),
    [missing],
  );

  const run = async () => {
    if (charCount === 0 || tooLong || missing.length > 0) return;
    setBusy(true);
    try {
      const hit = await engine.find(query, alphabet, generationMode);
      setResult(hit);
      if (hit.found) {
        openLocation(hit.index, hit.position, query);
      }
    } finally {
      setBusy(false);
    }
  };

  // After enabling the missing groups, automatically retry the search.
  useEffect(() => {
    if (!pendingSearch) return;
    if (missing.length === 0 && query.length > 0) {
      setPendingSearch(false);
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSearch, missing.length, query]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void run();
  };

  const groupEnableKey = (id: GroupId) => GROUPS.find((group) => group.id === id)?.enableKey;

  const status = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
      <span className={tooLong ? 'text-app-danger' : 'text-app-faint'}>
        {t('search.queryLength', {
          count: number(charCount),
          total: number(PAGE_LENGTH),
        })}
      </span>
      <span className={missing.length > 0 ? 'text-app-warning' : 'text-app-success'}>
        {t('search.alphabetValidation')}{' '}
        {missing.length > 0
          ? t('search.missingCount', { count: number(missing.length) })
          : t('search.allAvailable')}
      </span>
    </div>
  );

  const matchNav = search && search.matches.length > 0 && (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-xs">
      <span className="font-mono text-app-muted">
        {number(search.active + 1)} / {number(search.matches.length)}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost !px-2.5 !py-1 text-xs"
          onClick={prevMatch}
          disabled={search.matches.length < 2}
        >
          <IconArrowLeft width={14} height={14} />
          {t('search.previousMatch')}
        </button>
        <button
          type="button"
          className="btn btn-ghost !px-2.5 !py-1 text-xs"
          onClick={nextMatch}
          disabled={search.matches.length < 2}
        >
          {t('search.nextMatch')}
          <IconArrowRight width={14} height={14} />
        </button>
      </div>
    </div>
  );

  const body = (
    <>
      {inline && (
        <div className="mb-3">
          <p className="label">{t('search.title')}</p>
          <p className="mt-1 text-xs text-app-faint">{t('search.subtitle')}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <textarea
          ref={inputRef}
          rows={inline ? 1 : 4}
          className={`input font-mono text-sm ${inline ? 'min-h-[44px] resize-none' : 'resize-y'}`}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setResult(null);
          }}
          onKeyDown={(event) => {
            if (inline && event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void run();
            }
          }}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary whitespace-nowrap sm:self-start"
          disabled={busy || charCount === 0 || tooLong || missing.length > 0}
        >
          <IconSearch width={16} height={16} />
          {busy ? t('search.searching') : t('search.button')}
        </button>
      </form>

      <div className="mt-2.5">{status}</div>

      {tooLong && (
        <div className="mt-3 rounded-xl border border-app-danger bg-app-danger-soft p-3.5 text-xs text-app-danger">
          {t('search.tooLong', { total: number(PAGE_LENGTH) })}
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-3 rounded-xl border border-app-warning bg-app-warning-soft p-3.5 text-xs">
          <p className="font-semibold text-app-warning">{t('search.missingTitle')}</p>
          <p className="mt-1 text-app-muted">{t('search.missingExplain')}</p>

          <p className="label mt-3">{t('search.missingList', { count: number(missing.length) })}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.map((character) => (
              <span
                key={`${character.codePoint}:${character.char}`}
                className="inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-2.5 py-1.5"
              >
                <span className="font-mono text-sm text-app-text">
                  {character.nameKey
                    ? `${character.symbol} ${t(character.nameKey)}`
                    : character.symbol}
                </span>
                {character.symbol !== character.codePoint && (
                  <span className="font-mono text-[10px] text-app-faint">{character.codePoint}</span>
                )}
              </span>
            ))}
          </div>

          <p className="mt-3 text-app-muted">
            {t('search.currentAlphabet', { count: number(alphabet.length) })}
          </p>

          {missingGroups.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary !px-3 !py-1.5 text-xs"
                onClick={() => {
                  enableGroups(missingGroups);
                  if (uncovered.length === 0) setPendingSearch(true);
                }}
              >
                {t('search.enableMissing')}
              </button>
              {missingGroups.map((id) => {
                const enableKey = groupEnableKey(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="btn !px-3 !py-1.5 text-[11px]"
                    onClick={() => enableGroups([id])}
                  >
                    {enableKey ? t(enableKey) : id}
                  </button>
                );
              })}
            </div>
          )}

          {uncovered.length > 0 && (
            <p className="mt-3 text-app-danger">
              {t('search.cannotEnable', {
                list: uncovered.map((c) => c.symbol).join(', '),
              })}
            </p>
          )}
        </div>
      )}

      {result?.found && (
        <div className="mt-3 rounded-xl border border-app-success bg-app-success-soft p-3.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-app-success">{t('search.found')}</p>
            <span className="font-mono text-app-muted" title={encodeAddress(result.index)}>
              {shortAddress(encodeAddress(result.index), 14, 8)}
            </span>
          </div>
          <p className="mt-1 text-app-muted">
            {t('search.foundExplain', { position: number(result.position) })}
          </p>
        </div>
      )}

      {matchNav && <div className="mt-3">{matchNav}</div>}
    </>
  );

  if (inline) {
    return <section className="card mb-5 p-4 sm:p-5">{body}</section>;
  }
  return <div className="space-y-1">{body}</div>;
}
