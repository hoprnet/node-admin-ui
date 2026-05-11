import type { PacketAverages, PacketCounter } from '../store/slices/node/initialState';

export const PACKET_HISTORY_MAX_MS = 15 * 60 * 1000;

const rateOverWindow = (
  history: PacketCounter[],
  newest: PacketCounter,
  windowMs: number,
  fallbackToAvailable = false,
): number | null => {
  if (newest.timestamp === null || newest.data === null) return null;
  const oldest = history[0];
  if (!oldest || oldest.timestamp === null || oldest.data === null) return null;
  const hasFullWindow = newest.timestamp - oldest.timestamp >= windowMs;
  if (!hasFullWindow && !fallbackToAvailable) return null;
  const first = hasFullWindow
    ? history.find((s) => s.timestamp !== null && s.timestamp >= newest.timestamp! - windowMs)
    : oldest;
  if (!first || first === newest || first.data === null || first.timestamp === null) return null;
  const deltaSec = (newest.timestamp - first.timestamp) / 1000;
  if (deltaSec <= 0) return null;
  return Number(BigInt(newest.data) - BigInt(first.data)) / deltaSec;
};

/**
 * Compute rolling rates (pkts/sec) for the most recent sample-to-sample interval
 * and over 1/5/15-minute windows. Returns null fields when history is too short.
 */
export const computePacketAverages = (history: PacketCounter[]): PacketAverages => {
  const empty: PacketAverages = { now: null, oneMin: null, fiveMin: null, fifteenMin: null };
  if (history.length === 0) return empty;
  const newest = history[history.length - 1];
  if (newest.timestamp === null || newest.data === null) return empty;

  let nowRate: number | null = null;
  if (history.length >= 2) {
    const prev = history[history.length - 2];
    if (prev.timestamp !== null && prev.data !== null && prev.timestamp !== newest.timestamp) {
      const deltaSec = (newest.timestamp - prev.timestamp) / 1000;
      if (deltaSec > 0) {
        nowRate = Number(BigInt(newest.data) - BigInt(prev.data)) / deltaSec;
      }
    }
  }

  return {
    now: nowRate,
    oneMin: rateOverWindow(history, newest, 60_000, true),
    fiveMin: rateOverWindow(history, newest, 5 * 60_000),
    fifteenMin: rateOverWindow(history, newest, 15 * 60_000),
  };
};

/**
 * Parses Node metrics to Apex charts ready data.
 * @param data The string of metrics from HOPRd.
 * @returns Apex chart ready {}.
 */
const ensureEntry = (parsed: any, key: string) => {
  if (!parsed[key]) {
    parsed[key] = {
      name: '',
      type: '',
      data: [],
      categories: [],
      length: 0,
    };
  }
  return parsed[key];
};

export const parseMetrics = (data: string) => {
  const parsed: any = {};
  const tmp = data.split('\n');
  let lastKey = '';
  for (let i = 0; i < tmp.length; i++) {
    const line = tmp[i];
    if (!line) continue;
    const string = line.split(' ');

    if (string[0] === '#' && string[1] === 'HELP') {
      const key = (lastKey = string[2]);
      ensureEntry(parsed, key).name = line.replace(`# HELP ${key} `, '');
    } else if (string[0] === '#' && string[1] === 'TYPE') {
      const key = (lastKey = string[2]);
      ensureEntry(parsed, key).type = line.replace(`# TYPE ${key} `, '');
    } else {
      if (!lastKey || !parsed[lastKey]) continue;
      const parsedData = parseFloat(string[string.length - 1]);
      if (!Number.isNaN(parsedData)) parsed[lastKey].data.push(parsedData);
      const category = string[0].replace(lastKey, '').replace(/^_/, '');
      parsed[lastKey].categories.push(category);
      parsed[lastKey].length++;
    }
  }

  console.log('Metrics:', parsed);
  return parsed;
};
