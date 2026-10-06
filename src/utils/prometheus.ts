/*
 * Minimal Prometheus text parsing for the in-browser metrics history
 * (Health page). Only the series listed in TRACKED_SERIES are kept.
 */

export type MetricSample = {
  timestamp: number;
  values: Record<string, number>;
};

// Keep one hour of samples.
export const METRICS_HISTORY_MAX_MS = 60 * 60 * 1000;

export const TRACKED_SERIES = [
  'hopr_packets_count{type="sent"}',
  'hopr_packets_count{type="received"}',
  'hopr_packets_count{type="forwarded"}',
  'hopr_packet_rejected_count',
  'hopr_mixer_queue_size',
  'hopr_mixer_average_packet_delay',
  'hopr_transport_p2p_active_connection_count',
  'hopr_transport_p2p_nat_status',
  'hopr_peer_count',
  'hopr_network_health',
  'hopr_channels_count{direction="outgoing"}',
  'hopr_channels_count{direction="incoming"}',
  'hopr_tickets_count{type="winning"}',
  'hopr_tickets_count{type="losing"}',
  'hopr_strategy_auto_redeem_redeem_count',
  'hopr_strategy_channel_lifecycle_opens',
  'hopr_strategy_channel_lifecycle_closes',
  'hopr_strategy_channel_lifecycle_required_safe_balance_hopr',
] as const;

export type TrackedSeries = (typeof TRACKED_SERIES)[number];

const tracked = new Set<string>(TRACKED_SERIES);

/**
 * Extracts the tracked series from a Prometheus text exposition. A series
 * without labels in TRACKED_SERIES (e.g. hopr_packet_rejected_count) is the
 * sum over all its label combinations.
 */
export const extractSeries = (raw: string): Record<string, number> => {
  const values: Record<string, number> = {};
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const space = line.lastIndexOf(' ');
    if (space === -1) continue;
    const series = line.substring(0, space).trim();
    const value = Number(line.substring(space + 1));
    if (!Number.isFinite(value)) continue;
    const name = series.split('{')[0];
    if (tracked.has(series)) values[series] = value;
    else if (series !== name && tracked.has(name)) values[name] = (values[name] ?? 0) + value;
  }
  return values;
};

/** Value of one series in a single exposition, e.g. for alerts. */
export const readSeries = (raw: string | null | undefined, series: TrackedSeries): number | null => {
  if (!raw) return null;
  const value = extractSeries(raw)[series];
  return value === undefined ? null : value;
};

/** Per-second rate between consecutive samples of a counter. */
export const toRate = (samples: MetricSample[], series: string) => {
  const points: { t: number; v: number }[] = [];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1].values[series];
    const b = samples[i].values[series];
    const dt = (samples[i].timestamp - samples[i - 1].timestamp) / 1000;
    if (a === undefined || b === undefined || dt <= 0 || b < a) continue;
    points.push({ t: samples[i].timestamp, v: (b - a) / dt });
  }
  return points;
};

/** Raw values of a gauge over time. */
export const toGauge = (samples: MetricSample[], series: string) =>
  samples
    .filter((sample) => sample.values[series] !== undefined)
    .map((sample) => ({ t: sample.timestamp, v: sample.values[series] }));
