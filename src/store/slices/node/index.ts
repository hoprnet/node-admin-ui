import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { actionsAsync, createAsyncReducer } from './actionsAsync';
import { initialState } from './initialState';
import { isAddress, getAddress } from 'viem';
import { computeMergedAliases, loadNodeAliases, saveNodeAliases } from '../../../utils/aliases';

/**
 * Rebuilds the displayed aliases (own + merged in from the other saved nodes) and the
 * lookups derived from them. Call it after anything that can change what is displayed.
 */
const recomputeAliases = (state: typeof initialState) => {
  const { merged, source } = computeMergedAliases({
    ownAddress: state.addresses.data.native,
    ownAliases: state.aliasesOwn,
    ownNetwork: state.info.data?.hoprNetworkName ?? null,
  });

  state.aliases = merged;
  state.aliasesSource = source;
  state.links.aliasTopeerAddress = {};
  Object.keys(merged).forEach((peerAddress) => {
    state.links.aliasTopeerAddress[merged[peerAddress]] = peerAddress;
  });
  state.links.sortedAliases = Object.values(merged).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
  state.links.peerAddressesWithAliases = Object.keys(merged);
};

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
      state.info.data = action.payload;
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
    refreshAliases(state, action: PayloadAction<string | null>) {
      const peerAddress = action.payload;
      if (!peerAddress || !isAddress(peerAddress)) return;
      state.aliasesOwn = loadNodeAliases(peerAddress);
      recomputeAliases(state);
    },
    setAlias(state, action: PayloadAction<{ peerAddress: string; alias: string }>) {
      const peerAddress = action.payload.peerAddress;
      const alias = action.payload.alias;
      if (!peerAddress || !alias || !isAddress(peerAddress)) return;
      const peerAddressValidated = getAddress(peerAddress);
      // aliases are always saved on the node we are connected to
      state.aliasesOwn[peerAddressValidated] = alias;
      saveNodeAliases(state.addresses.data.native, state.aliasesOwn);
      recomputeAliases(state);
    },
    removeAlias(state, action: PayloadAction<string>) {
      const peerAddress = action.payload;
      if (!peerAddress || !isAddress(peerAddress)) return;
      const peerAddressValidated = getAddress(peerAddress);
      const ownAddress =
        state.addresses.data.native && isAddress(state.addresses.data.native)
          ? getAddress(state.addresses.data.native)
          : null;
      // a displayed alias can belong to another saved node, delete it where it lives
      const sourceAddress = state.aliasesSource[peerAddressValidated] ?? ownAddress;
      if (!sourceAddress) return;

      if (sourceAddress === ownAddress) {
        delete state.aliasesOwn[peerAddressValidated];
        saveNodeAliases(ownAddress, state.aliasesOwn);
      } else {
        const sourceAliases = loadNodeAliases(sourceAddress);
        delete sourceAliases[peerAddressValidated];
        saveNodeAliases(sourceAddress, sourceAliases);
      }
      recomputeAliases(state);
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
