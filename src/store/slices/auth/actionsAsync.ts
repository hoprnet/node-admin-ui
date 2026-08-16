import {
  GetInfoResponseType,
  GetAddressesResponseType,
  GetBalancesResponseType,
  IsNodeStartedResponseType,
  api,
  utils,
} from '@hoprnet/hopr-sdk';
import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { parseEther } from 'viem';
import { RootState, useAppSelector } from '../..';
import { nodeActionsAsync } from '../node';
import { initialState } from './initialState';
import { parseAndFormatUrl } from '../../../utils/parseAndFormatUrl';
const { sdkApiError } = utils;
const { getInfo, getAddresses, getBalances, isNodeStarted } = api;

export const loginThunk = createAsyncThunk<
  GetInfoResponseType | { force: boolean } | undefined,
  { apiToken: string; apiEndpoint: string; force?: boolean },
  { state: RootState; rejectValue: { data: string; type: 'API_ERROR' | 'CUSTOM_ERROR' | 'FETCH_ERROR' } }
>('auth/login', async (payload, { rejectWithValue, dispatch }) => {
  if (payload.force) {
    return {
      force: true,
    };
  }

  const { apiEndpoint, apiToken } = payload;

  let info, addresses, balances, nodeStarted;

  try {
    const calls = await Promise.allSettled([
      isNodeStarted({
        apiEndpoint: apiEndpoint,
        apiToken: apiToken,
      }),
      getInfo({
        apiEndpoint: apiEndpoint,
        apiToken: apiToken,
      }),
      getAddresses({
        apiEndpoint: apiEndpoint,
        apiToken: apiToken,
      }),
      getBalances({
        apiEndpoint: apiEndpoint,
        apiToken: apiToken,
      }),
    ]);

    if (calls[0].status === 'fulfilled') nodeStarted = calls[0].value as IsNodeStartedResponseType;
    if (calls[1].status === 'fulfilled') info = calls[1].value as GetInfoResponseType;
    if (calls[2].status === 'fulfilled') addresses = calls[2].value as GetAddressesResponseType;
    if (calls[3].status === 'fulfilled') balances = calls[3].value as GetBalancesResponseType;

    if (calls[0].status === 'rejected') throw new sdkApiError(calls[0].reason);
    if (calls[1].status === 'rejected') throw new sdkApiError(calls[1].reason);
    if (calls[2].status === 'rejected') throw new sdkApiError(calls[2].reason);
    if (calls[3].status === 'rejected') throw new sdkApiError(calls[3].reason);

    return info;
  } catch (e) {
    console.error('Error during loginThunk', e);

    if (e instanceof sdkApiError && e.hoprdErrorPayload?.status === 'UNAUTHORIZED') {
      return rejectWithValue({
        data: e.hoprdErrorPayload?.status ?? e.hoprdErrorPayload?.error,
        type: 'API_ERROR',
      });
    }

    if (e instanceof sdkApiError && e.hoprdErrorPayload?.error?.includes('get_peer_multiaddresses')) {
      const peerAddressIsAvailable = addresses?.native ? `\n\nNode Address: ${addresses.native}` : '';
      return rejectWithValue({
        data: 'Your Node seems to be starting, wait a couple of minutes before accessing it.' + peerAddressIsAvailable,
        type: 'API_ERROR',
      });
    }

    const minimumNodeBalance = parseEther('0.001');

    if (balances?.native !== undefined && BigInt(balances.native) < minimumNodeBalance) {
      return rejectWithValue({
        data:
          'Unable to connect.\n\n' +
          `Your xDai balance seems too low to operate the node.\nPlease top up your node.\nAddress: ${addresses?.native}`,
        type: 'CUSTOM_ERROR',
      });
    }

    return rejectWithValue({
      data: 'Unable to connect to the node.\n\nError:\n' + JSON.stringify(e, null, 2),
      type: 'FETCH_ERROR',
    });
  }
});

export const createAsyncReducer = (builder: ActionReducerMapBuilder<typeof initialState>) => {
  builder.addCase(loginThunk.pending, (state) => {
    state.status.connecting = true;
    state.status.connected = false;
    state.status.error = null;
  });
  builder.addCase(loginThunk.fulfilled, (state, action) => {
    if (action.payload) {
      state.status.connecting = false;
      state.status.connected = true;
      state.status.error = null;

      // Keep the saved node's network name up to date. Runs for both login paths
      // (connect modal and login by url), so it also picks up a network rename.
      const network = 'hoprNetworkName' in action.payload ? action.payload.hoprNetworkName : null;
      // login by url passes the raw endpoint while the node list holds the formatted one
      const apiEndpoint = parseAndFormatUrl(action.meta.arg.apiEndpoint) ?? action.meta.arg.apiEndpoint;
      const existingItem = state.nodes.findIndex((item) => item.apiEndpoint === apiEndpoint);
      if (network && existingItem !== -1 && state.nodes[existingItem].network !== network) {
        state.nodes[existingItem].network = network;
        localStorage.setItem('admin-ui-node-list', JSON.stringify(state.nodes));
      }
    }
  });
  builder.addCase(loginThunk.rejected, (state, meta) => {
    state.status.connecting = false;
    if (meta.payload) {
      state.status.error = {
        data: meta.payload.data,
        type: meta.payload.type,
      };
    } else {
      state.status.error = {
        data: 'Unable to connect.\n\n' + meta.error.message,
        type: 'FETCH_ERROR',
      };
    }
  });
};

export const actionsAsync = { loginThunk };
