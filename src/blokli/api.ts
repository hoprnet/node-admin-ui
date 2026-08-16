import { queryBlokli, unwrapUnion } from './client';
import { parseTokenValue, type ChannelStatsType, type TicketRedemptionType, type TokenValueString } from './types';

export type BlokliPayloadType = {
  blokliUrl: string;
  timeout?: number;
};

const CHANNEL_STATS_QUERY = `
  query AdminChannelStats($safeAddress: String!) {
    channelStats(safeAddress: $safeAddress, status: OPEN) {
      __typename
      ... on ChannelStats {
        count
        balance
      }
      ... on InvalidAddressError {
        code
        message
      }
      ... on QueryFailedError {
        code
        message
      }
    }
  }
`;

/**
 * Total wxHOPR held in the OPEN outgoing channels of every node registered to the safe.
 * The safeAddress filter is source-side only, so this is outgoing-only by definition,
 * and blokli does the sum server side - no need to enumerate the safe's nodes.
 */
export const getChannelStats = async (
  payload: BlokliPayloadType & { safeAddress: string },
): Promise<ChannelStatsType> => {
  const data = await queryBlokli<{
    channelStats: { __typename?: string; count?: number; balance?: TokenValueString } | null;
  }>(payload.blokliUrl, CHANNEL_STATS_QUERY, { safeAddress: payload.safeAddress }, payload.timeout);

  const stats = unwrapUnion<{ count: number; balance: TokenValueString }>(data.channelStats, 'ChannelStats');
  const balance = parseTokenValue(stats.balance);

  return {
    count: stats.count,
    value: balance.value,
    formatted: balance.formatted,
  };
};

const TICKET_REDEMPTION_QUERY = `
  query AdminTicketRedemptionStats($nodeAddress: String!) {
    ticketRedemptionStats(filter: { nodeAddress: $nodeAddress }) {
      __typename
      ... on RedeemedStats {
        redeemedAmount
        redemptionCount
        rejectedAmount
        rejectionCount
      }
      ... on InvalidAddressError {
        code
        message
      }
      ... on MissingFilterError {
        code
        message
      }
      ... on QueryFailedError {
        code
        message
      }
    }
  }
`;

/**
 * Lifetime on-chain ticket redemptions for a node. Unlike the node's own ticket
 * statistics this is not reset when the node database is wiped.
 */
export const getTicketRedemptionStats = async (
  payload: BlokliPayloadType & { nodeAddress: string },
): Promise<TicketRedemptionType> => {
  const data = await queryBlokli<{
    ticketRedemptionStats: { __typename?: string } | null;
  }>(payload.blokliUrl, TICKET_REDEMPTION_QUERY, { nodeAddress: payload.nodeAddress }, payload.timeout);

  const stats = unwrapUnion<{
    redeemedAmount: TokenValueString;
    redemptionCount: string;
    rejectedAmount: TokenValueString;
    rejectionCount: string;
  }>(data.ticketRedemptionStats, 'RedeemedStats');

  return {
    redeemed: parseTokenValue(stats.redeemedAmount),
    // UInt64 fields come back as strings, keep them as such
    redemptionCount: stats.redemptionCount,
    rejected: parseTokenValue(stats.rejectedAmount),
    rejectionCount: stats.rejectionCount,
  };
};
