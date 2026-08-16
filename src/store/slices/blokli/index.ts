import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { isAddress, getAddress } from 'viem';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from '../../../utils/localStorage';
import { actionsAsync, createAsyncReducer } from './actionsAsync';
import { initialState } from './initialState';

const urlKey = (nodeAddress: string) => `blokli/url/${getAddress(nodeAddress)}`;

const blokliSlice = createSlice({
  name: 'blokli',
  initialState,
  reducers: {
    resetState: () => initialState,
    // handle the per node blokli url
    loadUrlFromLocalStorage(state, action: PayloadAction<string | null>) {
      const nodeAddress = action.payload;
      if (!nodeAddress || !isAddress(nodeAddress)) return;
      state.nodeAddress = getAddress(nodeAddress);
      state.url = (loadStateFromLocalStorage(urlKey(nodeAddress)) as string | null) ?? null;
    },
    setUrl(state, action: PayloadAction<{ nodeAddress: string | null; url: string }>) {
      const nodeAddress = action.payload.nodeAddress;
      if (!nodeAddress || !isAddress(nodeAddress)) return;
      state.url = action.payload.url;
      saveStateToLocalStorage(urlKey(nodeAddress), action.payload.url);
    },
    resetUrl(state, action: PayloadAction<string | null>) {
      const nodeAddress = action.payload;
      state.url = null;
      if (!nodeAddress || !isAddress(nodeAddress)) return;
      localStorage.removeItem(urlKey(nodeAddress));
    },
  },
  extraReducers: (builder) => createAsyncReducer(builder),
});

export const blokliActions = blokliSlice.actions;
export const blokliActionsAsync = actionsAsync;
export default blokliSlice.reducer;
