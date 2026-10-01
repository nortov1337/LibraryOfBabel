/** Human-friendly number formatting for the statistics panel. */

export function groupDigits(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

export function formatInt(value: number | bigint): string {
  return groupDigits(value.toString());
}

/** Scientific representation of base^exponent as { mantissa, exponent }. */
export function scientific(base: number, exponent: number): { mantissa: number; exponent: number } {
  const log10 = exponent * Math.log10(base);
  const e = Math.floor(log10);
  const mantissa = Math.pow(10, log10 - e);
  return { mantissa, exponent: e };
}

/** e.g. "6.35 × 10^12041" */
export function formatPowerOfTen(base: number, exponent: number): string {
  const { mantissa, exponent: e } = scientific(base, exponent);
  return `${mantissa.toFixed(2)} × 10^${groupDigits(String(e))}`;
}

/** e.g. "N^6400" */
export function formatPower(baseLabel: string, exponent: number): string {
  return `${baseLabel}^${exponent}`;
}

/** Compact display of a huge decimal string: leading digits + scientific. */
export function abbreviateDecimal(decimal: string, head = 6): string {
  if (decimal.length <= head + 3) return groupDigits(decimal);
  const exponent = decimal.length - 1;
  const mantissa = Number(decimal.slice(0, 4)) / 1000;
  return `${mantissa.toFixed(2)} × 10^${groupDigits(String(exponent))}`;
}
