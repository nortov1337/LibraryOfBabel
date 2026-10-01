import { useMemo } from 'react';
import { useLibrary } from '../../state/LibraryContext';
import { PAGE_LENGTH, pageSpaceSize } from '../../lib/page';
import { countDigits } from '../../lib/alphabet';
import { shortAddress } from '../../lib/address';
import { SlideOver } from '../Modal';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-3.5">
      <p className="label">{label}</p>
      <p className="mt-1.5 font-mono text-sm text-app-text">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-app-faint">{sub}</p>}
    </div>
  );
}

export function StatsPanel() {
  const { alphabet, alphabetCode, address, index, generationMode, closePanel, t, number } =
    useLibrary();

  const stats = useMemo(() => {
    const N = alphabet.length;
    const exponent = PAGE_LENGTH * Math.log10(N);
    const expFloor = Math.floor(exponent);
    const mantissa = Math.pow(10, exponent - expFloor);
    const space = pageSpaceSize(alphabet);
    const decimal = space.toString();
    return {
      N,
      digits: countDigits(alphabet),
      exponent: expFloor,
      mantissa,
      decimalLength: decimal.length,
    };
  }, [alphabet]);

  return (
    <SlideOver title={t('stats.title')} subtitle={t('stats.subtitle')} onClose={closePanel}>
      <div className="space-y-4">
        <div className="rounded-xl border border-app-accent bg-app-accent-soft p-4">
          <p className="label text-app-accent">{t('stats.possiblePages')}</p>
          <p className="mt-2 font-serif text-2xl text-app-text">
            {number(stats.N)}
            <sup className="text-base">{number(PAGE_LENGTH)}</sup>
          </p>
          <p className="mt-1 font-mono text-xs text-app-muted">
            ≈ {stats.mantissa.toFixed(2)} × 10^{number(stats.exponent)}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-app-muted">
            {t('stats.sameTexts', { digits: number(stats.decimalLength) })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('stats.alphabetSize')} value={number(stats.N)} sub={alphabetCode.toUpperCase()} />
          <Stat label={t('stats.pageLength')} value={number(PAGE_LENGTH)} sub={t('stats.fixed')} />
          <Stat
            label={t('stats.digitsInAlphabet')}
            value={number(stats.digits)}
            sub={stats.digits ? t('stats.included') : t('stats.excluded')}
          />
          <Stat label={t('stats.base')} value={`base-${number(stats.N)}`} sub={t('stats.baseSub')} />
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface p-3.5">
          <p className="label">{t('stats.generationMode')}</p>
          <p className="mt-1.5 font-mono text-sm text-app-text">
            {generationMode === 'pseudo' ? t('generation.pseudo') : t('generation.traditional')}
          </p>
          <p className="mt-1 text-[11px] text-app-faint">
            {generationMode === 'pseudo'
              ? t('generation.pseudo.tooltip')
              : t('generation.traditional.tooltip')}
          </p>
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface p-3.5">
          <p className="label">{t('stats.currentAddress')}</p>
          <p className="mt-1.5 break-all font-mono text-[11px] text-app-muted">
            {shortAddress(address, 24, 16)}
          </p>
          <p className="mt-1 text-[11px] text-app-faint">
            {t('stats.addressLength', { count: number(address.length) })}
          </p>
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface p-3.5">
          <p className="label">{t('stats.currentIndex')}</p>
          <p className="mt-1.5 break-all font-mono text-[11px] text-app-muted">
            {shortAddress(index.toString(), 30, 20)}
          </p>
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface p-3.5">
          <p className="label">{t('stats.alphabet')}</p>
          <p className="mt-1.5 break-all font-mono text-xs leading-relaxed text-app-muted">
            {alphabet.join('')}
          </p>
        </div>
      </div>
    </SlideOver>
  );
}
