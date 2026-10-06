/*
 * Display formatting shared by every page. Full precision values stay
 * available through tooltips (see components/Data).
 */

const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

/** 1234.567891 -> "1,234.5679"; tiny non-zero values -> "<0.0001". */
export const formatAmount = (value: string | number | null | undefined, maxDecimals = 4): string => {
  const n = toNumber(value);
  if (n === null) return value === null || value === undefined || value === '' ? '-' : String(value);
  const min = 1 / 10 ** maxDecimals;
  if (n !== 0 && Math.abs(n) < min) return `${n < 0 ? '>-' : '<'}${min.toFixed(maxDecimals)}`;
  return n.toLocaleString('en-US', { maximumFractionDigits: maxDecimals });
};

/** 1295905 -> "1.30M" */
export const formatCompact = (value: number | null | undefined, digits = 2): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return value.toLocaleString('en-US', {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 10_000 ? digits : Math.abs(value) < 10 ? 2 : 0,
  });
};

/** 0x7ca8...f4f4 */
export const shortAddress = (address: string | null | undefined, chars = 4): string => {
  if (!address) return '-';
  if (address.length <= 2 + chars * 2 + 1) return address;
  return `${address.substring(0, 2 + chars)}…${address.substring(address.length - chars)}`;
};

/** 93784s -> "1d 2h 3m" */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return '-';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.floor(seconds)}s`;
};

/** "12s ago", "3m ago" */
export const formatAgo = (timestamp: number | null | undefined, now = Date.now()): string => {
  if (!timestamp) return 'never';
  const s = Math.max(0, Math.round((now - timestamp) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};
