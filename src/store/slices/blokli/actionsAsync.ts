import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { api, utils, type ChannelStatsType, type SafeNodeType, type TicketRedemptionType } from '../../../blokli';
import { initialState } from './initialState';
import { RootState } from '../..';

const { blokliApiError } = utils;
const { getChannelStats, getSafeNodes, getTicketRedemptionStats } = api;

/**
 * nodeAddress and blokliUrl are carried on every payload so the fulfilled reducers
 * can drop results that belong to a node we are no longer connected to or to a
 * previous blokli url, the same way the node slice guards on apiEndpoint.
 */
type BlokliThunkPayload = {
  blokliUrl: string;
  nodeAddress: string;
};

const getChannelStatsThunk = createAsyncThunk<
  ChannelStatsType | undefined,
  BlokliThunkPayload & { safeAddress: string },
  { state: RootState }
>(
  'blokli/getChannelStats',
  async (payload, { rejectWithValue }) => {
    try {
      const channelStats = await getChannelStats({
        blokliUrl: payload.blokliUrl,
        safeAddress: payload.safeAddress,
      });
      return channelStats;
    } catch (e) {
      if (e instanceof blokliApiError) {
        return rejectWithValue({
          code: e.code,
          message: e.message,
        });
      }
      return rejectWithValue({ message: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().blokli.channelStats.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getTicketRedemptionStatsThunk = createAsyncThunk<
  TicketRedemptionType | undefined,
  BlokliThunkPayload,
  { state: RootState }
>(
  'blokli/getTicketRedemptionStats',
  async (payload, { rejectWithValue }) => {
    try {
      const stats = await getTicketRedemptionStats({
        blokliUrl: payload.blokliUrl,
        nodeAddress: payload.nodeAddress,
      });
      return stats;
    } catch (e) {
      if (e instanceof blokliApiError) {
        return rejectWithValue({
          code: e.code,
          message: e.message,
        });
      }
      return rejectWithValue({ message: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().blokli.ticketRedemption.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

const getSafeNodesThunk = createAsyncThunk<
  SafeNodeType[] | undefined,
  BlokliThunkPayload & { safeAddress: string },
  { state: RootState }
>(
  'blokli/getSafeNodes',
  async (payload, { rejectWithValue }) => {
    try {
      const safeNodes = await getSafeNodes({
        blokliUrl: payload.blokliUrl,
        safeAddress: payload.safeAddress,
      });
      return safeNodes;
    } catch (e) {
      if (e instanceof blokliApiError) {
        return rejectWithValue({
          code: e.code,
          message: e.message,
        });
      }
      return rejectWithValue({ message: JSON.stringify(e) });
    }
  },
  {
    condition: (_payload, { getState }) => {
      const isFetching = getState().blokli.safeNodes.isFetching;
      if (isFetching) {
        return false;
      }
    },
  },
);

export const createAsyncReducer = (builder: ActionReducerMapBuilder<typeof initialState>) => {
  // getChannelStats
  builder.addCase(getChannelStatsThunk.pending, (state) => {
    state.channelStats.isFetching = true;
  });
  builder.addCase(getChannelStatsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.nodeAddress !== state.nodeAddress) return;
    if (action.meta.arg.blokliUrl !== state.urlInUse) return;
    if (action.payload) {
      state.channelStats.data = action.payload;
    }
    state.channelStats.isFetching = false;
  });
  builder.addCase(getChannelStatsThunk.rejected, (state) => {
    state.channelStats.isFetching = false;
  });

  // getTicketRedemptionStats
  builder.addCase(getTicketRedemptionStatsThunk.pending, (state) => {
    state.ticketRedemption.isFetching = true;
  });
  builder.addCase(getTicketRedemptionStatsThunk.fulfilled, (state, action) => {
    if (action.meta.arg.nodeAddress !== state.nodeAddress) return;
    if (action.meta.arg.blokliUrl !== state.urlInUse) return;
    if (action.payload) {
      state.ticketRedemption.data = action.payload;
    }
    state.ticketRedemption.isFetching = false;
  });
  builder.addCase(getTicketRedemptionStatsThunk.rejected, (state) => {
    state.ticketRedemption.isFetching = false;
  });

  // getSafeNodes
  builder.addCase(getSafeNodesThunk.pending, (state) => {
    state.safeNodes.isFetching = true;
  });
  builder.addCase(getSafeNodesThunk.fulfilled, (state, action) => {
    if (action.meta.arg.nodeAddress !== state.nodeAddress) return;
    if (action.meta.arg.blokliUrl !== state.urlInUse) return;
    if (action.payload) {
      state.safeNodes.data = action.payload;
    }
    state.safeNodes.isFetching = false;
  });
  builder.addCase(getSafeNodesThunk.rejected, (state) => {
    state.safeNodes.isFetching = false;
  });
};

export const actionsAsync = {
  getChannelStatsThunk,
  getSafeNodesThunk,
  getTicketRedemptionStatsThunk,
};
