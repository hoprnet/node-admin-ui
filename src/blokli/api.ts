import { formatEther, getAddress } from 'viem';
import { queryBlokli, tryUnwrapUnion, unwrapUnion } from './client';
import {
  parseTokenValue,
  type ChannelStatsType,
  type SafeNodeType,
  type TicketRedemptionType,
  type TokenValueString,
} from './types';

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

// safe(address:) is deprecated in blokli's target schema in favor of
// safeBy(address:, selector:), the swap is mechanical once deployed everywhere
const SAFE_NODES_QUERY = `
  query AdminSafeNodes($safeAddress: String!) {
    safe(address: $safeAddress) {
      __typename
      ... on Safe {
        registeredNodes
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

// one request for the OPEN channels of the whole safe, grouped by source keyid
// client side - much cheaper than per node channelStats calls
const SAFE_CHANNELS_QUERY = `
  query AdminSafeChannels($safeAddress: String!) {
    channels(safeAddress: $safeAddress, status: OPEN) {
      __typename
      ... on ChannelsList {
        channels {
          source
          balance
        }
      }
      ... on MissingFilterError {
        code
        message
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
 * Blokli enforces a query complexity budget of 500 per request and weighs the
 * RPC-backed root fields: nativeBalance costs 50 and ticketRedemptionStats 100,
 * so the aliased batches below are chunked to stay under the budget.
 */
const ACCOUNTS_PER_REQUEST = 40;
const NATIVE_BALANCES_PER_REQUEST = 8;
const REDEMPTIONS_PER_REQUEST = 4;

const buildAccountsQuery = (indexes: number[]) => {
  const variables = indexes.map((i) => `$a${i}: String!`).join(', ');
  const fields = indexes
    .map(
      (i) => `
    k${i}: accounts(chainKey: $a${i}) {
      __typename
      ... on AccountsList {
        accounts {
          keyid
          chainKey
        }
      }
      ... on MissingFilterError {
        code
        message
      }
      ... on QueryFailedError {
        code
        message
      }
    }`,
    )
    .join('\n');
  return `query AdminSafeNodeAccounts(${variables}) {${fields}
  }`;
};

const buildNativeBalancesQuery = (indexes: number[]) => {
  const variables = indexes.map((i) => `$a${i}: String!`).join(', ');
  const fields = indexes
    .map(
      (i) => `
    b${i}: nativeBalance(address: $a${i}) {
      __typename
      ... on NativeBalance {
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
    }`,
    )
    .join('\n');
  return `query AdminSafeNodeNativeBalances(${variables}) {${fields}
  }`;
};

const buildRedemptionsQuery = (indexes: number[]) => {
  const variables = indexes.map((i) => `$a${i}: String!`).join(', ');
  const fields = indexes
    .map(
      (i) => `
    r${i}: ticketRedemptionStats(filter: { nodeAddress: $a${i} }) {
      __typename
      ... on RedeemedStats {
        redeemedAmount
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
    }`,
    )
    .join('\n');
  return `query AdminSafeNodeRedemptions(${variables}) {${fields}
  }`;
};

/**
 * All nodes registered to the safe with their xDai balance, OPEN outgoing channel
 * stats and lifetime redeemed amount. Blokli has no single query for it, so this
 * assembles: safe() for the node list, one channels(safeAddress) request grouped
 * by source keyid client side, and complexity-chunked aliased batches for the
 * accounts, native balances and redemptions. Only the safe() lookup is a hard
 * failure - any other failing request or per node field just nulls the affected
 * cells, rendered as '-'.
 */
export const getSafeNodes = async (payload: BlokliPayloadType & { safeAddress: string }): Promise<SafeNodeType[]> => {
  const safeData = await queryBlokli<{
    safe: { __typename?: string; registeredNodes?: string[] } | null;
  }>(payload.blokliUrl, SAFE_NODES_QUERY, { safeAddress: payload.safeAddress }, payload.timeout);

  // blokli answers null (not an error member) when it does not know the safe
  if (safeData.safe === null) {
    console.warn(`Blokli does not know safe ${payload.safeAddress}`);
    return [];
  }
  const safe = unwrapUnion<{ registeredNodes: string[] }>(safeData.safe, 'Safe');

  // checksummed so the addresses match the alias and channel maps of the node slice
  const nodeAddresses = [...safe.registeredNodes].map((address) => getAddress(address)).sort();
  if (nodeAddresses.length === 0) return [];
  const indexes = nodeAddresses.map((_, i) => i);

  const runChunked = async (chunkSize: number, buildQuery: (chunkIndexes: number[]) => string) => {
    const merged: Record<string, { __typename?: string } | null> = {};
    const chunks: number[][] = [];
    for (let start = 0; start < indexes.length; start += chunkSize) {
      chunks.push(indexes.slice(start, start + chunkSize));
    }
    await Promise.all(
      chunks.map(async (chunkIndexes) => {
        try {
          const data = await queryBlokli<Record<string, { __typename?: string } | null>>(
            payload.blokliUrl,
            buildQuery(chunkIndexes),
            Object.fromEntries(chunkIndexes.map((i) => [`a${i}`, nodeAddresses[i]])),
            payload.timeout,
          );
          Object.assign(merged, data);
        } catch (e) {
          console.warn('Blokli batched safe nodes request failed', e);
        }
      }),
    );
    return merged;
  };

  const [accountsData, nativeData, redemptionData, channelsList] = await Promise.all([
    runChunked(ACCOUNTS_PER_REQUEST, buildAccountsQuery),
    runChunked(NATIVE_BALANCES_PER_REQUEST, buildNativeBalancesQuery),
    runChunked(REDEMPTIONS_PER_REQUEST, buildRedemptionsQuery),
    queryBlokli<{ channels: { __typename?: string } | null }>(
      payload.blokliUrl,
      SAFE_CHANNELS_QUERY,
      { safeAddress: payload.safeAddress },
      payload.timeout,
    )
      .then((data) =>
        tryUnwrapUnion<{ channels: { source: number; balance: TokenValueString }[] }>(data.channels, 'ChannelsList'),
      )
      .catch((e) => {
        console.warn('Blokli safe channels request failed', e);
        return null;
      }),
  ]);

  return nodeAddresses.map((nodeAddress, i) => {
    const accountsList = tryUnwrapUnion<{ accounts: { keyid: number; chainKey: string }[] }>(
      accountsData[`k${i}`],
      'AccountsList',
    );
    const keyid =
      accountsList?.accounts.find((account) => account.chainKey.toLowerCase() === nodeAddress.toLowerCase())?.keyid ??
      null;
    const native = tryUnwrapUnion<{ balance: TokenValueString }>(nativeData[`b${i}`], 'NativeBalance');
    const redeemedStats = tryUnwrapUnion<{ redeemedAmount: TokenValueString }>(
      redemptionData[`r${i}`],
      'RedeemedStats',
    );

    // a resolved keyid with no matching channels is real data (0 channels),
    // an unresolved keyid or a failed channels request is unknown ('-')
    let channels: ChannelStatsType | null = null;
    if (channelsList && keyid !== null) {
      const outgoing = channelsList.channels.filter((channel) => channel.source === keyid);
      const value = outgoing.reduce((sum, channel) => sum + BigInt(parseTokenValue(channel.balance).value), BigInt(0));
      channels = {
        count: outgoing.length,
        value: value.toString(),
        formatted: formatEther(value),
      };
    }

    return {
      nodeAddress,
      xDai: native ? parseTokenValue(native.balance) : null,
      channels,
      redeemed: redeemedStats ? parseTokenValue(redeemedStats.redeemedAmount) : null,
    };
  });
};
