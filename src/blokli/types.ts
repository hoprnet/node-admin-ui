import { parseUnits } from 'viem';

/**
 * Blokli returns token amounts as a formatted decimal with the symbol appended,
 * e.g. "2084.003187159723402252 wxHOPR" - not wei and not a bare number.
 */
export type TokenValueString = string;

export type TokenValueType = {
  value: string;
  formatted: string;
};

export type ChannelStatsType = {
  count: number;
  value: string;
  formatted: string;
};

export type TicketRedemptionType = {
  redeemed: TokenValueType;
  redemptionCount: string;
  rejected: TokenValueType;
  rejectionCount: string;
};

/**
 * One node registered to the safe. Null fields mean blokli could not answer for
 * that node - rendered as '-', never filled in from node data.
 */
export type SafeNodeType = {
  nodeAddress: string;
  xDai: TokenValueType | null;
  channels: ChannelStatsType | null;
  redeemed: TokenValueType | null;
};

/**
 * Splits a TokenValueString into the same { value, formatted } shape the node slice
 * uses for every balance. 18 decimals overflows float64, so the wei value goes
 * through viem's parseUnits and never through Number().
 */
export function parseTokenValue(tokenValue: TokenValueString | null | undefined): TokenValueType {
  const formatted = (tokenValue ?? '').trim().split(' ')[0];
  if (!formatted) {
    return {
      value: '0',
      formatted: '0',
    };
  }
  try {
    return {
      value: parseUnits(formatted, 18).toString(),
      formatted,
    };
  } catch (e) {
    console.warn('Could not parse blokli token value', tokenValue, e);
    return {
      value: '0',
      formatted: '0',
    };
  }
}
