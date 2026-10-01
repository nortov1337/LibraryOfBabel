import { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../state/LibraryContext';
import { loadLastSession } from '../lib/settings';
import { buildAlphabet, decodeAlphabet, encodeAlphabet } from '../lib/alphabet';
import { pageSpaceSize } from '../lib/page';
import { randomBigIntLessThan } from '../lib/bigint';
import { encodeAddress } from '../lib/address';
import { buildBookPath } from '../lib/url';

/** `/` -> restore last session, or open a fresh random page. */
export function HomeRedirect() {
  const { settings } = useLibrary();
  const [searchParams] = useSearchParams();

  const target = useMemo(() => {
    const urlGeneration = searchParams.get('g');
    const urlGenerationMode =
      urlGeneration === 'pseudo' || urlGeneration === 'traditional' ? urlGeneration : null;
    const last = loadLastSession();
    // Priority: URL mode > last session > saved preference > default.
    const generationMode = urlGenerationMode ?? last?.generationMode ?? settings.generationMode;

    if (last?.address) {
      return buildBookPath({
        address: last.address,
        alphabetCode: last.alphabetCode,
        mode: last.mode,
        generationMode,
      });
    }
    const code = searchParams.get('a') ?? encodeAlphabet(settings.groups);
    const alphabet = buildAlphabet(decodeAlphabet(code));
    const index = randomBigIntLessThan(pageSpaceSize(alphabet));
    return buildBookPath({
      address: encodeAddress(index),
      alphabetCode: code,
      mode: settings.mode,
      generationMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Navigate to={target} replace />;
}
