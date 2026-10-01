/** Page comparison. */

export interface CompareResult {
  lengthA: number;
  lengthB: number;
  total: number;
  equal: number;
  different: number;
  matchPercent: number;
  /** Per-character difference flags (1 = differs). */
  diffA: Uint8Array;
  diffB: Uint8Array;
}

export function comparePages(a: string, b: string): CompareResult {
  const total = Math.max(a.length, b.length);
  const diffA = new Uint8Array(a.length);
  const diffB = new Uint8Array(b.length);
  let equal = 0;
  let different = 0;

  for (let i = 0; i < total; i++) {
    const ca = i < a.length ? a[i] : undefined;
    const cb = i < b.length ? b[i] : undefined;
    if (ca === cb) {
      equal++;
    } else {
      different++;
      if (i < a.length) diffA[i] = 1;
      if (i < b.length) diffB[i] = 1;
    }
  }

  return {
    lengthA: a.length,
    lengthB: b.length,
    total,
    equal,
    different,
    matchPercent: total === 0 ? 100 : (equal / total) * 100,
    diffA,
    diffB,
  };
}
