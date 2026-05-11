import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { actionsAsync, createAsyncReducer } from './actionsAsync';
import { initialState } from './initialState';
import { isAddress, getAddress } from 'viem';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from '../../../utils/localStorage';

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    resetState: () => initialState,
    setInitiating(state) {
      state.status.initiating = true;
    },
    setInitiated(state) {
      state.status.initiating = false;
      state.status.initiated = true;
    },
    setApiEndpoint(state, action) {
      state.apiEndpoint = action.payload.apiEndpoint;
    },
    setInfo(state, action) {
      state.info = action.payload;
    },
    messageReceived(state, action: PayloadAction<(typeof initialState.messages.data)[0]>) {
      state.messages.data.push(action.payload);
      if (state.messages.data.length > 100)
        state.messages.data = state.messages.data.slice(state.messages.data.length - 100, state.messages.data.length);
    },
    // handle checkboxes
    toggleMessageSeen(state, action: PayloadAction<(typeof initialState.messages.data)[0]>) {
      state.messages.data = state.messages.data.map((message) => {
        if (message.id === action.payload.id) {
          return {
            ...message,
            seen: !message.seen,
          };
        }
        return message;
      });
    },
    toggleCheckbox(
      state,
      action: PayloadAction<{
        category: 'peers' | 'channelsIn' | 'channelsOut' | 'sessions';
        id: string;
        checked: boolean;
      }>,
    ) {
      const category = action.payload.category;
      const id = action.payload.id;
      const checked = action.payload.checked;
      if (checked) {
        state.checks[category][id] = true;
      } else {
        delete state.checks[category][id];
      }
    },
    removeAllCheckboxes(
      state,
      action: PayloadAction<{ category: 'peers' | 'channelsIn' | 'channelsOut' | 'sessions' }>,
    ) {
      const category = action.payload.category;
      state.checks[category] = {};
    },
    // handle aliases
    loadAliasesFromLocalStorage(state, action) {
      const peerAddress = action.payload;
      if (!isAddress(peerAddress)) return;
      const peerAddressValidated = getAddress(peerAddress);
      const aliases = loadStateFromLocalStorage(`node/aliases/${peerAddressValidated}`) as {
        [key: string]: string;
      } | null;
      if (aliases) {
        state.aliases = aliases;
        Object.keys(aliases).forEach((peerAddress) => {
          const alias = aliases[peerAddress];
          state.links.aliasTopeerAddress[alias] = peerAddress;
        });
        const sortedAliases = Object.values(aliases).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );
        state.links.sortedAliases = sortedAliases;
        state.links.peerAddressesWithAliases = Object.keys(aliases);
      }
    },
    setAlias(state, action: PayloadAction<{ peerAddress: string; alias: string }>) {
      const peerAddress = action.payload.peerAddress;
      const alias = action.payload.alias;
      if (!peerAddress || !alias || !isAddress(peerAddress)) return;
      const peerAddressValidated = getAddress(peerAddress);
      delete state.links.aliasTopeerAddress[state.aliases[peerAddressValidated]];
      state.aliases[peerAddressValidated] = alias;
      state.links.aliasTopeerAddress[alias] = peerAddressValidated;
      const sortedAliases = Object.values(state.aliases).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
      );
      state.links.sortedAliases = sortedAliases;
      state.links.peerAddressesWithAliases = Object.keys(state.aliases);
      saveStateToLocalStorage(`node/aliases/${state.addresses.data.native}`, state.aliases);
    },
    removeAlias(state, action: PayloadAction<string>) {
      const peerAddress = action.payload;
      if (state.aliases[peerAddress]) {
        delete state.links.aliasTopeerAddress[state.aliases[peerAddress]];
        delete state.aliases[peerAddress];
        const sortedAliases = Object.values(state.aliases).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );
        state.links.sortedAliases = sortedAliases;
        state.links.peerAddressesWithAliases = Object.keys(state.aliases);
      }
      saveStateToLocalStorage(`node/aliases/${state.addresses.data.native}`, state.aliases);
    },
    // handle ws state
    updateMessagesWebsocketStatus(state, action: PayloadAction<typeof initialState.messagesWebsocketStatus>) {
      state.messagesWebsocketStatus = action.payload;
    },
    // user actions to open and close ws
    initializeMessagesWebsocket() {
      // state changes in node middleware
    },
    closeMessagesWebsocket() {
      // state changes in node middleware
    },
    setMessageNotified(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (state.messages && state.messages.data[index]) {
        state.messages.data[index].notified = true;
      }
    },
  },
  extraReducers: (builder) => {
    createAsyncReducer(builder);
  },
});

export const nodeActions = nodeSlice.actions;
export const nodeActionsAsync = actionsAsync;
export default nodeSlice.reducer;
