import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { bubbleSortObject } from '../../../utils/functions';
import { loadStateFromLocalStorage } from '../../../utils/localStorage';
import { actionsAsync, createAsyncReducer } from './actionsAsync';
import { initialState } from './initialState';
import { isAddress } from 'viem';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetState: () => {
      const state = JSON.parse(JSON.stringify(initialState));
      const ADMIN_UI_NODE_LIST = loadStateFromLocalStorage('admin-ui-node-list');
      if (ADMIN_UI_NODE_LIST) state.nodes = ADMIN_UI_NODE_LIST;
      return state;
    },
    useNodeData(
      state,
      action: PayloadAction<{
        apiToken: string;
        apiEndpoint: string;
        localName?: string;
        jazzIcon?: string | null;
      }>,
    ) {
      // Check if we have a name saved locally
      let localName: string | null = action.payload.localName ? action.payload.localName : '';
      if (!localName) {
        const existingItem = state.nodes.findIndex((item) => item.apiEndpoint === action.payload.apiEndpoint);
        if (existingItem !== -1)
          localName = state.nodes[existingItem].localName ? state.nodes[existingItem].localName : '';
      }

      // Check if we have a jazzIcon saved locally
      let jazzIcon: string | null = action.payload.jazzIcon ? action.payload.jazzIcon : null;
      if (!jazzIcon) {
        const existingItem = state.nodes.findIndex((item) => item.apiEndpoint === action.payload.apiEndpoint);
        if (existingItem !== -1)
          jazzIcon = state.nodes[existingItem].jazzIcon ? (state.nodes[existingItem].jazzIcon as string) : null;
      }

      state.loginData.apiEndpoint = action.payload.apiEndpoint;
      state.loginData.apiToken = action.payload.apiToken ? action.payload.apiToken : '';
      state.loginData.localName = localName;
      state.loginData.jazzIcon = jazzIcon;
    },
    setConnected(state) {
      state.status.connecting = false;
      state.status.connected = true;
    },
    addNodeData(
      state,
      action: PayloadAction<{
        apiToken: string;
        apiEndpoint: string;
        localName: string;
      }>,
    ) {
      const newItem = action.payload;
      const existingItem = state.nodes.findIndex((item) => item.apiEndpoint === newItem.apiEndpoint);
      if (existingItem === -1) {
        state.nodes = [
          {
            apiEndpoint: action.payload.apiEndpoint,
            apiToken: action.payload.apiToken,
            localName: action.payload.localName,
          },
          ...state.nodes,
        ];
        state.nodes = bubbleSortObject(state.nodes, 'localName');
      } else {
        state.nodes[existingItem].apiToken = action.payload.apiToken;
        state.nodes[existingItem].localName = action.payload.localName;
      }

      localStorage.setItem('admin-ui-node-list', JSON.stringify(state.nodes));
    },
    addNodeJazzIcon(
      state,
      action: PayloadAction<{
        apiEndpoint: string;
        jazzIcon: string;
      }>,
    ) {
      const existingItem = state.nodes.findIndex((item) => item.apiEndpoint === action.payload.apiEndpoint);
      if (existingItem === -1) return;
      if (isAddress(action.payload.jazzIcon)) {
        state.nodes[existingItem].jazzIcon = action.payload.jazzIcon;
      } else {
        state.nodes[existingItem].jazzIcon = action.payload.jazzIcon;
      }

      localStorage.setItem('admin-ui-node-list', JSON.stringify(state.nodes));
    },
    clearLocalNodes(state) {
      state.nodes = [];
      localStorage.removeItem('admin-ui-node-list');
    },
    clearLocalNode(state, payload) {
      let tmp = state.nodes;
      delete tmp[parseInt(payload.payload)];
      tmp = tmp.filter((elem) => elem !== undefined);
      state.nodes = tmp;
      localStorage.setItem('admin-ui-node-list', JSON.stringify(state.nodes));
    },
    setOpenLoginModalToNode(state, action: PayloadAction<boolean>) {
      state.helper.openLoginModalToNode = action.payload;
    },
  },
  extraReducers: (builder) => createAsyncReducer(builder),
});

export const authActions = authSlice.actions;
export const authActionsAsync = actionsAsync;
export default authSlice.reducer;
