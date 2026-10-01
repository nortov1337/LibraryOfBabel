import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLibrary } from '../../state/LibraryContext';
import { engine } from '../../lib/engine';
import { comparePages, type CompareResult } from '../../lib/compare';
import { decodeAddress, encodeAddress, shortAddress } from '../../lib/address';
import { pageSpaceSize } from '../../lib/page';
import { randomBigIntLessThan } from '../../lib/bigint';
import type { GenerationMode } from '../../lib/settings';
import { GenerationModeToggle } from '../GenerationModeToggle';
import { Modal } from '../Modal';
import { IconCompare, IconDice, IconExternal } from '../icons';

function SideText({ text, diff, enabled }: { text: string; diff?: Uint8Array; enabled: boolean }) {
  if (!enabled || !diff) return <div className="page-text">{text}</div>;
  const spans: ReactNode[] = [];
  for (let i = 0; i < text.length; i++) {
    spans.push(
      diff[i] ? (
        <span key={i} className="diff-char">
          {text[i]}
        </span>
      ) : (
        <span key={i}>{text[i]}</span>
      ),
    );
  }
  return <div className="page-text">{spans}</div>;
}

export function ComparePanel() {
  const { address, alphabet, closePanel, openPage, generationMode, t, number, percent } =
    useLibrary();
  const [left, setLeft] = useState(address);
  const [right, setRight] = useState('');
  const [leftMode, setLeftMode] = useState<GenerationMode>(generationMode);
  const [rightMode, setRightMode] = useState<GenerationMode>(generationMode);
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [diffMode, setDiffMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSide = useCallback(
    async (value: string, mode: GenerationMode): Promise<string> => {
      return engine.generate(decodeAddress(value), alphabet, mode);
    },
    [alphabet],
  );

  const runCompare = useCallback(
    async (leftValue = left, rightValue = right) => {
      if (!leftValue || !rightValue) {
        setError(t('compare.errorBoth'));
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const [lt, rt] = await Promise.all([
          loadSide(leftValue, leftMode),
          loadSide(rightValue, rightMode),
        ]);
        setLeftText(lt);
        setRightText(rt);
        setResult(comparePages(lt, rt));
      } catch {
        setError(t('compare.errorLoad'));
      } finally {
        setBusy(false);
      }
    },
    [left, right, leftMode, rightMode, loadSide, t],
  );

  useEffect(() => {
    if (address) {
      setLeft(address);
    }
  }, [address]);

  const randomAddress = () => encodeAddress(randomBigIntLessThan(pageSpaceSize(alphabet)));

  return (
    <Modal title={t('compare.title')} onClose={closePanel} maxWidth="max-w-6xl">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-app-border bg-app-surface p-3">
            <p className="label">{t('compare.left')}</p>
            <div className="mt-2 flex gap-2">
              <input
                className="input min-w-0 font-mono text-xs"
                placeholder={t('compare.leftPlaceholder')}
                value={left}
                onChange={(event) => setLeft(event.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                className="btn !px-3"
                title={t('compare.useCurrent')}
                aria-label={t('compare.useCurrent')}
                onClick={() => {
                  setLeft(address);
                  setLeftMode(generationMode);
                }}
              >
                <IconExternal width={15} height={15} />
              </button>
              <button
                type="button"
                className="btn !px-3"
                title={t('compare.random')}
                aria-label={t('compare.random')}
                onClick={() => setLeft(randomAddress())}
              >
                <IconDice width={15} height={15} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="label">{t('compare.mode')}</span>
              <GenerationModeToggle value={leftMode} onChange={setLeftMode} />
            </div>
          </div>

          <div className="rounded-xl border border-app-border bg-app-surface p-3">
            <p className="label">{t('compare.right')}</p>
            <div className="mt-2 flex gap-2">
              <input
                className="input min-w-0 font-mono text-xs"
                placeholder={t('compare.rightPlaceholder')}
                value={right}
                onChange={(event) => setRight(event.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                className="btn !px-3"
                title={t('compare.useCurrent')}
                aria-label={t('compare.useCurrent')}
                onClick={() => {
                  setRight(address);
                  setRightMode(generationMode);
                }}
              >
                <IconExternal width={15} height={15} />
              </button>
              <button
                type="button"
                className="btn !px-3"
                title={t('compare.random')}
                aria-label={t('compare.random')}
                onClick={() => setRight(randomAddress())}
              >
                <IconDice width={15} height={15} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="label">{t('compare.mode')}</span>
              <GenerationModeToggle value={rightMode} onChange={setRightMode} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={() => runCompare()} disabled={busy}>
            <IconCompare width={16} height={16} />
            {busy ? t('compare.comparing') : t('compare.button')}
          </button>
          <button
            type="button"
            className={`btn ${diffMode ? 'btn-primary' : ''}`}
            onClick={() => setDiffMode((value) => !value)}
          >
            {t('compare.diffMode')}
          </button>
          {error && <span className="text-xs text-app-danger">{error}</span>}
        </div>

        {result && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-app-border bg-app-surface p-3">
              <p className="label">{t('compare.match')}</p>
              <p className="mt-1 font-mono text-lg text-app-success">{percent(result.matchPercent)}</p>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-3">
              <p className="label">{t('compare.matching')}</p>
              <p className="mt-1 font-mono text-lg text-app-text">{number(result.equal)}</p>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-3">
              <p className="label">{t('compare.differing')}</p>
              <p className="mt-1 font-mono text-lg text-app-danger">{number(result.different)}</p>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface p-3">
              <p className="label">{t('compare.total')}</p>
              <p className="mt-1 font-mono text-lg text-app-text">{number(result.total)}</p>
            </div>
          </div>
        )}

        {(leftText || rightText) && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-app-border bg-app-surface-2 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-mono text-[10px] text-app-faint">
                  {shortAddress(left, 14, 8)} ·{' '}
                  {leftMode === 'pseudo' ? t('generation.pseudo') : t('generation.traditional')}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost !px-2 !py-1 text-[10px]"
                  onClick={() => openPage(decodeAddress(left), { generationMode: leftMode })}
                >
                  {t('compare.open')}
                </button>
              </div>
              <div className="page-surface page-terminal max-h-72 overflow-y-auto rounded-lg border p-3 text-[11px] leading-relaxed">
                <SideText text={leftText} diff={result?.diffA} enabled={diffMode} />
              </div>
            </div>
            <div className="rounded-xl border border-app-border bg-app-surface-2 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-mono text-[10px] text-app-faint">
                  {shortAddress(right, 14, 8)} ·{' '}
                  {rightMode === 'pseudo' ? t('generation.pseudo') : t('generation.traditional')}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost !px-2 !py-1 text-[10px]"
                  onClick={() => openPage(decodeAddress(right), { generationMode: rightMode })}
                >
                  {t('compare.open')}
                </button>
              </div>
              <div className="page-surface page-terminal max-h-72 overflow-y-auto rounded-lg border p-3 text-[11px] leading-relaxed">
                <SideText text={rightText} diff={result?.diffB} enabled={diffMode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
