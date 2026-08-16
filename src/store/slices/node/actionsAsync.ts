import { ActionReducerMapBuilder, AnyAction, ThunkDispatch, createAsyncThunk } from '@reduxjs/toolkit';
import { initialState, ParsedStrategiesType } from './initialState';
import { v4 as uuidv4 } from 'uuid';
import {
  type BasePayloadType,
  type CloseChannelPayloadType,
  type CloseChannelResponseType,
  type OpenChannelPayloadType,
  type PingPeerPayloadType,
  type GetConfigurationResponseType,
  type FundChannelsPayloadType,
  type FundChannelsResponseType,
  type WithdrawPayloadType,
  type GetPeerPayloadType,
  type GetInfoResponseType,
  type GetTicketStatisticsResponseType,
  type GetChannelsResponseType,
  type IsNodeReadyResponseType,
  flows,
  api,
  utils,
  type OpenChannelResponseType,
  type GetPeerResponseType,
  type GetBalancesResponseType,
  type GetSessionsResponseType,
  type GetTicketPriceResponseType,
  type GetMinimumNetworkProbabilityResponseType,
  type OpenSessionPayloadType,
  type CloseSessionPayloadType,
  type GetConnectedResponseType,
  type GetAnnouncedResponseType,
  RedeemAllTicketsPayloadType,
} from '@hoprnet/hopr-sdk';
import { parseMetrics, computePacketAverages, PACKET_HISTORY_MAX_MS } from '../../../utils/metrics';
import { RootState } from '../..';
import { formatEther, parseEther } from 'viem';
import { sendNotification } from '../../../hooks/useWatcher/notifications';
import { useAppDispatch } from '../../../store';
import { authActions } from '../auth';

const { sdkApiError } = utils;
const {
  closeChannel,
  getAddresses,
  getBalances,
  getAnnounced,
  getConnected,
  getChannel,
  getChannels,
  getConfiguration,
  getInfo,
  getMetrics,
  getTicketStatistics,
  getTicketPrice,
  getMinimumTicketProbability,
  getSessions,
  openSession,
  closeSession,
  fundChannel,
  getVersion,
  openChannel,
  pingPeer,
  getPeer, // old getPeerInfo
  redeemAllTickets,
  withdraw,
  isNodeReady,
} = api;
const { openMultipleChannels } = flows;

const isNodeReadyThunk = createAsyncThunk<IsNodeReadyResponseType | undefined, BasePayloadType, { state: RootState }>(
  'node/isNodeReady',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await isNodeReady(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.nodeIsReady.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getInfoThunk = createAsyncThunk<GetInfoResponseType | undefined, BasePayloadType, { state: RootState }>(
  'node/getInfo',
  async (payload, { rejectWithValue }) => {
    try {
      const info = await getInfo(payload);
      return info;
    } catch (e) {
      console.error(e);
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.info.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getAddressesThunk = createAsyncThunk<
  | {
      native: string;
    }
  | undefined,
  BasePayloadType & { force?: boolean },
  { state: RootState }
>(
  'node/getAccount',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const addresses = await getAddresses(payload);
      if (addresses?.native) {
        dispatch(
          authActions.addNodeJazzIcon({
            apiEndpoint: payload.apiEndpoint as string,
            jazzIcon: addresses.native,
          }),
        );
        // links the saved node to its `node/aliases/<nodeAddress>` entry
        dispatch(
          authActions.updateNodeMetadata({
            apiEndpoint: payload.apiEndpoint as string,
            nodeAddress: addresses.native,
          }),
        );
      }
      return addresses;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      if (_payload.force) {
        return true;
      }

      const isFetching = getState().node.addresses.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getBalancesThunk = createAsyncThunk<
  GetBalancesResponseType | undefined,
  BasePayloadType & { force?: boolean },
  { state: RootState; dispatch: ThunkDispatch<RootState, unknown, AnyAction> }
>(
  'node/getBalances',
  async (payload, { rejectWithValue }) => {
    try {
      const balances = await getBalances(payload);
      return balances;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      if (_payload.force) {
        return true;
      }

      const isFetching = getState().node.balances.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getChannelsThunk = createAsyncThunk<GetChannelsResponseType | undefined, BasePayloadType, { state: RootState }>(
  'node/getChannels',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const channels = await getChannels(payload);
      return channels;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.channels.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getConfigurationThunk = createAsyncThunk<
  GetConfigurationResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getConfiguration',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const configuration = await getConfiguration(payload);
      return configuration;
    } catch (e) {
      console.error('getConfigurationThunk', e);
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.configuration.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getConnectedPeersThunk = createAsyncThunk<
  GetConnectedResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getConnectedPeers',
  async (payload, { rejectWithValue }) => {
    try {
      const peers = await getConnected(payload);
      return peers;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.peersConnected.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getAnnouncedPeersThunk = createAsyncThunk<
  GetAnnouncedResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getAnnouncedPeers',
  async (payload, { rejectWithValue }) => {
    try {
      const peers = await getAnnounced(payload);
      return peers;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.peersAnnounced.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getTicketStatisticsThunk = createAsyncThunk<
  GetTicketStatisticsResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getTicketStatistics',
  async (payload, { rejectWithValue }) => {
    try {
      const statistics = await getTicketStatistics(payload);
      return statistics;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.statistics.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getVersionThunk = createAsyncThunk<string | undefined, BasePayloadType, { state: RootState }>(
  'node/getVersion',
  async (payload, { rejectWithValue }) => {
    try {
      const version = await getVersion(payload);
      return version;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.version.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const withdrawThunk = createAsyncThunk<string | undefined, WithdrawPayloadType, { state: RootState }>(
  'node/withdraw',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await withdraw(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.transactions.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const closeChannelThunk = createAsyncThunk<CloseChannelResponseType, CloseChannelPayloadType, { state: RootState }>(
  'node/closeChannel',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await closeChannel(payload);
      dispatch(getChannelsThunk(payload));
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const address = _payload.address;
      const direction = _payload.direction;
      let isClosing = false;
      if (direction === 'outgoing' && getState().node.channels.parsed.outgoing[address]) {
        isClosing = !!getState().node.channels.parsed.outgoing[address].isClosing;
      } else if (direction === 'incoming' && getState().node.channels.parsed.incoming[address]) {
        isClosing = !!getState().node.channels.parsed.incoming[address].isClosing;
      }
      if (isClosing) {
        return false;
      }
    },
  },
);

const openChannelThunk = createAsyncThunk<OpenChannelResponseType, OpenChannelPayloadType, { state: RootState }>(
  'node/openChannel',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await openChannel(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
);

const fundChannelThunk = createAsyncThunk<FundChannelsResponseType, FundChannelsPayloadType, { state: RootState }>(
  'node/fundChannel',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fundChannel(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
);

// will not be used for now, as it doesn't give good errors
const openMultipleChannelsThunk = createAsyncThunk(
  'node/openMultipleChannels',
  async (
    payload: {
      apiEndpoint: string;
      apiToken: string;
      peerAddresss: string[];
      amount: string;
      timeout?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await openMultipleChannels({
        apiEndpoint: payload.apiEndpoint,
        apiToken: payload.apiToken,
        timeout: payload.timeout,
        destinations: payload.peerAddresss,
        amount: payload.amount,
      });
      if (typeof res === 'undefined')
        throw new sdkApiError({
          status: 400,
          statusText: 'Node does not have enough balance to fund channels',
        });
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
);

const redeemChannelTicketsThunk = createAsyncThunk<
  boolean | undefined,
  RedeemAllTicketsPayloadType,
  { state: RootState }
>(
  'node/redeemChannelTickets',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await redeemAllTickets(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.redeemAllTickets.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const pingNodeThunk = createAsyncThunk('node/pingNode', async (payload: PingPeerPayloadType, { rejectWithValue }) => {
  try {
    const res = await pingPeer(payload);
    return {
      ...res,
      peerAddress: payload.address,
    };
  } catch (e) {
    if (e instanceof sdkApiError) {
      return rejectWithValue(e);
    }
    return rejectWithValue({ status: JSON.stringify(e) });
  }
});

const redeemAllTicketsThunk = createAsyncThunk<boolean | undefined, BasePayloadType, { state: RootState }>(
  'node/redeemAllTickets',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await redeemAllTickets(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.redeemAllTickets.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

// const resetTicketStatisticsThunk = createAsyncThunk<boolean | undefined, BasePayloadType, { state: RootState }>(
//   'node/resetTicketStatisticsThunk',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const res = await resetTicketStatistics(payload);
//       return res;
//     } catch (e) {
//       if (e instanceof sdkApiError) {
//         return rejectWithValue(e);
//       }
//       return rejectWithValue({ status: JSON.stringify(e) });
//     }
//   },
//   {
//     condition: (_payload, { getState }) => {
//       const isFetching = getState().node.resetTicketStatistics.isFetching;
//       if (isFetching) {
//         return false;
//       }
//     },
//   },
// );

const getPrometheusMetricsThunk = createAsyncThunk<string | undefined, BasePayloadType, { state: RootState }>(
  'node/getPrometheusMetrics',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getMetrics(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.metrics.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getTicketPriceThunk = createAsyncThunk<
  GetTicketPriceResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getTicketPrice',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getTicketPrice(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.ticketPrice.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getMinimumNetworkProbabilityThunk = createAsyncThunk<
  GetMinimumNetworkProbabilityResponseType | undefined,
  BasePayloadType,
  { state: RootState }
>(
  'node/getMinimumTicketProbability',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getMinimumTicketProbability(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.probability.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getSessionsThunk = createAsyncThunk<GetSessionsResponseType | undefined, BasePayloadType, { state: RootState }>(
  'node/getSessionsThunk',
  async (payload, { rejectWithValue }) => {
    try {
      const bothRes = await Promise.all([
        getSessions({
          ...payload,
          protocol: 'tcp',
        }),
        getSessions({
          ...payload,
          protocol: 'udp',
        }),
      ]);
      const res = [...bothRes[0], ...bothRes[1]];
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().node.sessions.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const openSessionThunk = createAsyncThunk(
  'node/openSession',
  async (payload: OpenSessionPayloadType, { rejectWithValue }) => {
    try {
      const res = await openSession(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
);

const closeSessionThunk = createAsyncThunk(
  'node/closeSession',
  async (payload: CloseSessionPayloadType, { rejectWithValue }) => {
    try {
      const res = await closeSession(payload);
      return res;
    } catch (e) {
      if (e instanceof sdkApiError) {
        return rejectWithValue(e);
      }
      return rejectWithValue({ status: JSON.stringify(e) });
    }
  },
);

const isCurrentApiEndpointTheSame = createAsyncThunk<boolean, string, { state: RootState }>(
  'node/isCurrentApiEndpointTheSame',
  async (payload, { getState }) => {
    const apiEndpoint = getState().node.apiEndpoint;
    console.log('node/isCurrentApiEndpointTheSame', apiEndpoint, payload);
    return payload === apiEndpoint;
  },
);

export const createAsyncReducer = (builder: ActionReducerMapBuilder<typeof initialState>) => {
  // isNodeReady
  builder.addCase(isNodeReadyThunk.pending, (state) => {
    state.nodeIsReady.isFetching = true;
  });
  builder.addCase(isNodeReadyThunk.rejected, (state) => {
    state.nodeIsReady.isFetching = false;
  });
  builder.addCase(isNodeReadyThunk.fulfilled, (state, action) => {
    // console.log('isNodeReadyThunk', action.payload);
    if (action.payload) {
      state.nodeIsReady.data = action.payload;
    }
    state.nodeIsReady.isFetching = true;
  });
  // getInfo
  builder.addCase(getInfoThunk.pending, (state) => {
    state.info.isFetching = true;
  });
  builder.addCase(getInfoThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.info.data = action.payload;
    }
    state.info.isFetching = false;
  });
  builder.addCase(getInfoThunk.rejected, (state) => {
    state.info.isFetching = false;
  });
  // getAddresses
  builder.addCase(getAddressesThunk.pending, (state) => {
    state.addresses.isFetching = true;
  });
  builder.addCase(getAddressesThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.addresses.data = action.payload;
    }
    state.addresses.isFetching = false;
  });
  builder.addCase(getAddressesThunk.rejected, (state) => {
    state.addresses.isFetching = false;
  });
  // getBalances
  builder.addCase(getBalancesThunk.pending, (state) => {
    state.balances.isFetching = true;
  });
  builder.addCase(getBalancesThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.balances.data = {
        native: {
          value: parseEther(action.payload.native).toString(),
          formatted: action.payload.native,
        },
        hopr: {
          value: parseEther(action.payload.hopr).toString(),
          formatted: action.payload.hopr,
        },
        safeHopr: {
          value: parseEther(action.payload.safeHopr).toString(),
          formatted: action.payload.safeHopr,
        },
        safeNative: {
          value: parseEther(action.payload.safeNative).toString(),
          formatted: action.payload.safeNative,
        },
        safeHoprAllowance: {
          value: parseEther(action.payload.safeHoprAllowance).toString(),
          formatted: action.payload.safeHoprAllowance,
        },
        channels: {
          value: state.balances.data.channels.value,
          formatted: state.balances.data.channels.formatted,
        },
      };
      if (!state.balances.alreadyFetched) state.balances.alreadyFetched = true;
      state.balances.isFetching = false;
    }
  });
  builder.addCase(getBalancesThunk.rejected, (state) => {
    state.balances.isFetching = false;
  });
  // getChannels
  builder.addCase(getChannelsThunk.pending, (state, action) => {
    state.channels.isFetching = true;
  });
  builder.addCase(getChannelsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    const channels = action.payload;
    if (channels) {
      console.log('getChannels', channels);
      state.channels.data = channels;
      if (channels.outgoing.length > 0) {
        let balance = BigInt(0);
        channels.outgoing.forEach((channel) => (balance += parseEther(channel.balance)));
        state.balances.data.channels = {
          value: balance.toString(),
          formatted: formatEther(balance),
        };
      } else {
        state.balances.data.channels = {
          value: '0',
          formatted: '0',
        };
      }

      // Parse the data

      // Save isClosing status
      const areClosingOutgoing = [];
      const areClosingIncoming = [];
      const outgoingIds = Object.keys(state.channels.parsed.outgoing);
      const incomingIds = Object.keys(state.channels.parsed.incoming);
      for (let i = 0; i < outgoingIds.length; i++) {
        const channelId = outgoingIds[i];
        if (state.channels.parsed.outgoing[channelId].isClosing) {
          areClosingOutgoing.push(channelId);
        }
      }
      for (let i = 0; i < incomingIds.length; i++) {
        const channelId = incomingIds[i];
        if (state.channels.parsed.incoming[channelId].isClosing) {
          areClosingIncoming.push(channelId);
        }
      }

      // Clean store to make sure that removed channels do not stay here
      state.channels.parsed.outgoing = {};
      state.links.peerAddressToOutgoingChannel = {};

      // Regenerate channels
      for (let i = 0; i < channels.outgoing.length; i++) {
        const channelId = channels.outgoing[i].id;
        const peerAddress = channels.outgoing[i].peerAddress;
        state.links.peerAddressToOutgoingChannel[peerAddress] = channelId;

        if (!state.channels.parsed.outgoing[channelId]) {
          state.channels.parsed.outgoing[channelId] = {
            balance: channels.outgoing[i].balance,
            peerAddress: peerAddress,
            status: channels.outgoing[i].status,
            isClosing: areClosingOutgoing.includes(channelId),
          };
        } else {
          state.channels.parsed.outgoing[channelId].balance = channels.outgoing[i].balance;
          state.channels.parsed.outgoing[channelId].peerAddress = peerAddress;
          state.channels.parsed.outgoing[channelId].status = channels.outgoing[i].status;
          state.channels.parsed.outgoing[channelId].isClosing = areClosingOutgoing.includes(channelId);
        }
      }

      state.channels.parsed.incoming = {};
      for (let i = 0; i < channels.incoming.length; i++) {
        const channelId = channels.incoming[i].id;
        const peerAddress = channels.incoming[i].peerAddress;
        state.links.peerAddressToIncomingChannel[peerAddress] = channelId;
        state.links.incomingChannelTopeerAddress[channelId] = peerAddress;

        if (!state.channels.parsed.incoming[channelId]) {
          state.channels.parsed.incoming[channelId] = {
            balance: channels.incoming[i].balance,
            peerAddress: peerAddress,
            status: channels.incoming[i].status,
            tickets: 0,
            ticketBalance: '0',
            isClosing: areClosingIncoming.includes(channelId),
          };
        } else {
          state.channels.parsed.incoming[channelId].balance = channels.incoming[i].balance;
          state.channels.parsed.incoming[channelId].peerAddress = peerAddress;
          state.channels.parsed.incoming[channelId].status = channels.incoming[i].status;
          state.channels.parsed.incoming[channelId].isClosing = areClosingIncoming.includes(channelId);
        }
      }
    }

    if (!state.channels.alreadyFetched) state.channels.alreadyFetched = true;
    state.channels.isFetching = false;
  });
  builder.addCase(getChannelsThunk.rejected, (state, action) => {
    state.channels.isFetching = false;
  });
  //openChannel
  builder.addCase(openChannelThunk.pending, (state, action) => {
    const peerAddress = action.meta.arg.destination;
    if (!peerAddress) return;
    state.channels.parsed.outgoingOpening[peerAddress] = true;
  });
  builder.addCase(openChannelThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    const peerAddress = action.meta.arg.destination;
    if (!peerAddress) return;
    state.channels.parsed.outgoingOpening[peerAddress] = false;
  });
  builder.addCase(openChannelThunk.rejected, (state, action) => {
    const peerAddress = action.meta.arg.destination;
    if (!peerAddress) return;
    state.channels.parsed.outgoingOpening[peerAddress] = false;
  });
  //closeChannel
  builder.addCase(closeChannelThunk.pending, (state, action) => {
    const address = action.meta.arg.address;
    const direction = action.meta.arg.direction;
    if (direction === 'outgoing' && state.channels.parsed.outgoing[address])
      state.channels.parsed.outgoing[address].isClosing = true;
    if (direction === 'incoming' && state.channels.parsed.incoming[address])
      state.channels.parsed.incoming[address].isClosing = true;
  });
  builder.addCase(closeChannelThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    const address = action.meta.arg.address;
    const direction = action.meta.arg.direction;
    if (direction === 'outgoing' && state.channels.parsed.outgoing[address])
      state.channels.parsed.outgoing[address].isClosing = false;
    if (direction === 'incoming' && state.channels.parsed.incoming[address])
      state.channels.parsed.incoming[address].isClosing = false;
  });
  builder.addCase(closeChannelThunk.rejected, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    const address = action.meta.arg.address;
    const direction = action.meta.arg.direction;
    if (direction === 'outgoing' && state.channels.parsed.outgoing[address])
      state.channels.parsed.outgoing[address].isClosing = false;
    if (direction === 'incoming' && state.channels.parsed.incoming[address])
      state.channels.parsed.incoming[address].isClosing = false;
  });
  //getConfiguration
  builder.addCase(getConfigurationThunk.pending, (state, action) => {
    state.configuration.isFetching = true;
  });
  builder.addCase(getConfigurationThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.configuration.data = action.payload;

      const parsedStrategies: ParsedStrategiesType = {};

      action.payload?.strategy?.strategies?.forEach((strategyObj: ParsedStrategiesType) => {
        try {
          const strategyName = Object.keys(strategyObj)[0];
          if (typeof strategyName !== 'string') return;
          const tmp = strategyObj[strategyName];
          if (!tmp) return;
          parsedStrategies[strategyName] = tmp;
        } catch (e) {
          console.warn('Error parsing strategy', e);
        }
      });

      state.configuration.parsedStrategies = parsedStrategies;
    }
    state.configuration.isFetching = false;
  });
  builder.addCase(getConfigurationThunk.rejected, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    state.configuration.isFetching = false;
  });
  // getConnectedPeers
  builder.addCase(getConnectedPeersThunk.pending, (state) => {
    state.peersConnected.isFetching = true;
  });
  builder.addCase(getConnectedPeersThunk.fulfilled, (state, action) => {
    state.peersConnected.isFetching = false;
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.peersConnected.data = action.payload || [];
      const sortedConnectedPeers = action.payload?.map((peer) => peer.address).sort();
      state.peersConnected.parsed.sorted = sortedConnectedPeers || [];
      action.payload?.forEach((peer) => {
        state.peersConnected.parsed.obj[peer.address] = peer;
      });
    }

    if (!state.peersConnected.alreadyFetched) state.peersConnected.alreadyFetched = true;
  });
  builder.addCase(getConnectedPeersThunk.rejected, (state) => {
    state.peersConnected.isFetching = false;
  });
  // getAnnouncedPeers
  builder.addCase(getAnnouncedPeersThunk.pending, (state) => {
    state.peersAnnounced.isFetching = true;
  });
  builder.addCase(getAnnouncedPeersThunk.fulfilled, (state, action) => {
    state.peersAnnounced.isFetching = false;
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.peersAnnounced.data = action.payload || [];
      const sortedAnnouncedPeers = action.payload?.map((peer) => peer.address).sort();
      state.peersAnnounced.parsed.sorted = sortedAnnouncedPeers || [];
      action.payload?.forEach((peer) => {
        state.peersAnnounced.parsed.obj[peer.address] = peer;
      });
    }

    if (!state.peersAnnounced.alreadyFetched) state.peersAnnounced.alreadyFetched = true;
  });
  builder.addCase(getAnnouncedPeersThunk.rejected, (state) => {
    state.peersAnnounced.isFetching = false;
  });
  // redeemAllTicketsThunk
  builder.addCase(redeemAllTicketsThunk.pending, (state) => {
    state.redeemAllTickets.isFetching = true;
  });
  builder.addCase(redeemAllTicketsThunk.fulfilled, (state) => {
    state.redeemAllTickets.isFetching = false;
    state.redeemAllTickets.error = undefined;
  });
  builder.addCase(redeemAllTicketsThunk.rejected, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    state.redeemAllTickets.isFetching = false;
    // Assign the error to the errors state
    state.redeemAllTickets.error = (
      action.payload as {
        status: string | undefined;
        error: string | undefined;
      }
    ).error;
  });
  // resetTicketStatisticsThunk
  // builder.addCase(resetTicketStatisticsThunk.pending, (state) => {
  //   state.resetTicketStatistics.isFetching = true;
  // });
  // builder.addCase(resetTicketStatisticsThunk.fulfilled, (state) => {
  //   if (!state.statistics.data) return;
  //   state.statistics.data.neglectedValue = '0';
  //   state.statistics.data.redeemedValue = '0';
  //   state.statistics.data.rejectedValue = '0';
  //   state.statistics.data.winningCount = 0;
  //   state.resetTicketStatistics.isFetching = false;
  // });
  // builder.addCase(resetTicketStatisticsThunk.rejected, (state) => {
  //   state.resetTicketStatistics.isFetching = false;
  // });
  // getVersion
  builder.addCase(getVersionThunk.pending, (state) => {
    state.version.isFetching = true;
  });
  builder.addCase(getVersionThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.version.data = action.payload;
    }
    state.version.isFetching = false;
  });
  builder.addCase(getVersionThunk.rejected, (state) => {
    state.version.isFetching = false;
  });
  // withdraw
  builder.addCase(withdrawThunk.pending, (state) => {
    state.transactions.isFetching = true;
  });
  builder.addCase(withdrawThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.transactions.data.push(action.payload);
    }
    state.transactions.isFetching = false;
  });
  builder.addCase(withdrawThunk.rejected, (state) => {
    state.transactions.isFetching = false;
  });
  // getTicketStatistics
  builder.addCase(getTicketStatisticsThunk.pending, (state) => {
    state.statistics.isFetching = true;
  });
  builder.addCase(getTicketStatisticsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      state.statistics.data = action.payload;
    }
    state.statistics.isFetching = false;
  });
  builder.addCase(getTicketStatisticsThunk.rejected, (state) => {
    state.statistics.isFetching = false;
  });
  // pingNode
  builder.addCase(pingNodeThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      const pingExists = state.pings.findIndex((ping) => ping.peerAddress === action.payload?.peerAddress);

      if (!action.payload.peerAddress) return;

      if (pingExists) {
        state.pings[pingExists] = {
          latency: action.payload.latency,
          peerAddress: action.payload.peerAddress,
        };
      } else {
        state.pings.push({
          latency: action.payload.latency,
          peerAddress: action.payload.peerAddress,
        });
      }
    }
  });
  // getPrometheusMetrics
  builder.addCase(getPrometheusMetricsThunk.pending, (state) => {
    state.metrics.isFetching = true;
  });
  builder.addCase(getPrometheusMetricsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    if (action.payload) {
      const now = Date.now();
      state.metrics.data.raw = action.payload;
      const jsonMetrics = parseMetrics(action.payload);
      state.metrics.data.parsed = jsonMetrics;

      // count tickets
      state.metricsParsed.tickets.incoming = {
        redeemed: {},
        unredeemed: {},
      };
      // disable for now as the metric is not available on the test node
      // if (
      //   false &&
      //   jsonMetrics?.hopr_tickets_incoming_statistics?.categories &&
      //   jsonMetrics?.hopr_tickets_incoming_statistics?.data
      // ) {
      //   const categories = jsonMetrics.hopr_tickets_incoming_statistics.categories;
      //   const data = jsonMetrics?.hopr_tickets_incoming_statistics?.data;
      //   for (let i = 0; i < categories.length; i++) {
      //     const channel = categories[i]
      //       .match(/channel="0x[a-f0-9]+"/gi)[0]
      //       .replace(`channel="`, ``)
      //       .replace(`"`, ``);
      //     const statistic = categories[i]
      //       .match(/statistic="[a-z_]+"/g)[0]
      //       .replace(`statistic="`, ``)
      //       .replace(`"`, ``);
      //     const value = data[i];
      //     if (value) {
      //       if (statistic === 'unredeemed') {
      //         state.metricsParsed.tickets.incoming.unredeemed[channel] = {
      //           value: `${value}`,
      //           formatted: formatEther(BigInt(`${value}`)),
      //         };
      //       } else if (statistic === 'redeemed') {
      //         state.metricsParsed.tickets.incoming.redeemed[channel] = {
      //           value: `${value}`,
      //           formatted: formatEther(BigInt(`${value}`)),
      //         };
      //       }
      //     }
      //   }
      // }

      // nodeStartEpoch
      try {
        if (jsonMetrics?.hopr_start_time) {
          const nodeStartEpoch = jsonMetrics.hopr_start_time?.data[0];
          state.metricsParsed.nodeStartEpoch = nodeStartEpoch;
        }
      } catch (e) {
        console.warn('Error parsing node startup epoch');
      }

      // packets sent and received and forwarded
      try {
        if (jsonMetrics?.hopr_packets_count) {
          const categories: string[] = jsonMetrics.hopr_packets_count.categories ?? [];
          const data: number[] = jsonMetrics.hopr_packets_count.data ?? [];
          for (let i = 0; i < categories.length; i++) {
            const match = categories[i].match(/type="([^"]+)"/);
            if (!match) continue;
            const kind = match[1];
            if (kind !== 'sent' && kind !== 'received' && kind !== 'forwarded') continue;
            const value = data[i];
            if (value === undefined || value === null) continue;
            const slot = state.metricsParsed.packets[kind];
            const newest = slot.history[slot.history.length - 1];
            if (newest && newest.timestamp !== null && now - newest.timestamp < 30_000) continue;
            slot.history.push({ data: value.toString(), timestamp: now });
            const cutoff = now - PACKET_HISTORY_MAX_MS;
            while (slot.history.length > 0 && (slot.history[0].timestamp ?? 0) < cutoff) {
              slot.history.shift();
            }
            slot.averages = computePacketAverages(slot.history);
          }
        }
      } catch (e) {
        console.warn('Error parsing packets count', e);
      }
    }
    state.metrics.isFetching = false;
  });
  builder.addCase(getPrometheusMetricsThunk.rejected, (state) => {
    state.metrics.isFetching = false;
  });
  // redeemChannelTickets
  builder.addCase(redeemChannelTicketsThunk.pending, (state) => {
    state.redeemAllTickets.isFetching = true;
  });
  builder.addCase(redeemChannelTicketsThunk.fulfilled, (state) => {
    state.redeemAllTickets.isFetching = false;
  });
  builder.addCase(redeemChannelTicketsThunk.rejected, (state) => {
    state.redeemAllTickets.isFetching = false;
  });
  // getTicketPrice
  builder.addCase(getTicketPriceThunk.pending, (state) => {
    state.ticketPrice.isFetching = true;
  });
  builder.addCase(getTicketPriceThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    state.ticketPrice.data = action.payload?.price || null;
    state.ticketPrice.isFetching = false;
  });
  builder.addCase(getTicketPriceThunk.rejected, (state) => {
    state.ticketPrice.isFetching = false;
  });
  // getMinimumNetworkProbability
  builder.addCase(getMinimumNetworkProbabilityThunk.pending, (state) => {
    state.probability.isFetching = true;
  });
  builder.addCase(getMinimumNetworkProbabilityThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    state.probability.data = action.payload?.probability || null;
    state.probability.isFetching = false;
  });
  builder.addCase(getMinimumNetworkProbabilityThunk.rejected, (state) => {
    state.probability.isFetching = false;
  });
  // getSessionsThunk
  builder.addCase(getSessionsThunk.pending, (state) => {
    state.sessions.isFetching = true;
  });
  builder.addCase(getSessionsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.apiEndpoint !== state.apiEndpoint) return;
    state.sessions.data = action.payload || null;
    state.sessions.isFetching = false;
  });
  builder.addCase(getSessionsThunk.rejected, (state) => {
    state.sessions.isFetching = false;
  });
};

export const actionsAsync = {
  isNodeReadyThunk,
  getInfoThunk,
  getAddressesThunk,
  getBalancesThunk,
  getChannelsThunk,
  getConfigurationThunk,
  getConnectedPeersThunk,
  getAnnouncedPeersThunk,
  getTicketStatisticsThunk,
  getPrometheusMetricsThunk,
  getVersionThunk,
  withdrawThunk,
  closeChannelThunk,
  fundChannelThunk,
  openChannelThunk,
  openMultipleChannelsThunk,
  redeemChannelTicketsThunk,
  pingNodeThunk,
  redeemAllTicketsThunk,
  //  resetTicketStatisticsThunk,
  getTicketPriceThunk,
  getMinimumNetworkProbabilityThunk,
  getSessionsThunk,
  openSessionThunk,
  closeSessionThunk,
  isCurrentApiEndpointTheSame,
};
