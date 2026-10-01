import { useMemo } from 'react';
import { useLibrary } from '../../state/LibraryContext';
import { PAGE_LENGTH } from '../../lib/page';
import { decodeAddress, encodeAddress, shortAddress } from '../../lib/address';
import { SlideOver } from '../Modal';
import { IconCheck, IconClose } from '../icons';

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-3">
      <p className="label">{label}</p>
      <p className={`mt-1.5 break-all text-xs text-app-text ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export function DebugPanel() {
  const { alphabet, alphabetCode, address, index, verification, verify, closePanel, t, number } =
    useLibrary();

  const decoded = useMemo(() => {
    try {
      return decodeAddress(address).toString();
    } catch {
      return '—';
    }
  }, [address]);

  const reencodedMatch = useMemo(() => {
    try {
      return encodeAddress(decodeAddress(address)) === address;
    } catch {
      return false;
    }
  }, [address]);

  return (
    <SlideOver title={t('debug.title')} subtitle={t('debug.subtitle')} onClose={closePanel}>
      <div className="space-y-3">
        <Row label={t('debug.alphabetSize')} value={number(alphabet.length)} />
        <Row label={t('debug.alphabetCode')} value={alphabetCode.toUpperCase()} />
        <Row label={t('debug.pageLength')} value={number(PAGE_LENGTH)} />
        <Row label={t('debug.pageIndex')} value={index.toString()} />
        <Row label={t('debug.encodedIndex')} value={address} />
        <Row label={t('debug.decodedIndex')} value={decoded} />

        <div className="rounded-xl border border-app-border bg-app-surface p-3">
          <p className="label">{t('debug.roundTrip')}</p>
          <p className="mt-1.5 flex items-center gap-2 text-xs text-app-text">
            {reencodedMatch ? (
              <>
                <IconCheck width={15} height={15} className="text-app-success" />
                {t('debug.roundTripOk')}
              </>
            ) : (
              <>
                <IconClose width={15} height={15} className="text-app-danger" />
                {t('debug.roundTripFail')}
              </>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface p-3">
          <p className="label">{t('debug.checksum')}</p>
          <p className="mt-1.5 break-all font-mono text-[11px] text-app-muted">
            {verification.checksum ?? '—'}
          </p>
          {verification.status === 'ok' && (
            <p className="mt-2 text-xs text-app-success">{t('debug.verifyOk')}</p>
          )}
          {verification.status === 'fail' && (
            <p className="mt-2 text-xs text-app-danger">
              {verification.errorKey ? t(verification.errorKey) : t('debug.verifyFail')}
              {verification.errorDetail ? `: ${verification.errorDetail}` : ''}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={verify}
          disabled={verification.status === 'running'}
        >
          {verification.status === 'running' ? t('debug.verifying') : t('debug.verify')}
        </button>

        <p className="text-[11px] leading-relaxed text-app-faint">
          {t('debug.verifyHint', { address: shortAddress(address, 12, 8) })}
        </p>
      </div>
    </SlideOver>
  );
}
