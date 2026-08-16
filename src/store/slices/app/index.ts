import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { GetBalancesResponseType, GetChannelsResponseType, GetInfoResponseType } from '@hoprnet/hopr-sdk';
import { saveStateToLocalStorage } from '../../../utils/localStorage';
import { ChannelsOutgoingType, ChannelsIncomingType } from '../../../store/slices/node/initialState';

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    resetState: () => initialState,
    resetNodeState: (state) => ({
      ...state,
      previousStates: {
        ...state.previousStates,
        prevApiEndpoint: null,
        prevOutgoingChannels: null,
        prevIncomingChannels: null,
        prevMessagesUuids: [],
        prevNodeBalances: null,
        prevNodeInfo: null,
      },
    }),
    setNotificationSettings: (state, action: PayloadAction<typeof initialState.configuration.notifications>) => {
      if (action.payload) {
        state.configuration.notifications = action.payload;
        saveStateToLocalStorage('app/configuration/notifications', action.payload);
      }
    },
    setAliasSettings: (state, action: PayloadAction<typeof initialState.configuration.aliases>) => {
      if (action.payload) {
        state.configuration.aliases = action.payload;
        saveStateToLocalStorage('app/configuration/aliases', action.payload);
      }
    },
    addNotification: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        source: string;
        timeout: number | null;
        url: string | null;
      }>,
    ) => {
      const now = Date.now();
      const defaultTimeout = 5000;
      state.notifications.push({
        ...action.payload,
        seen: false,
        interacted: false,
        timeout: action.payload.timeout ?? now + defaultTimeout,
      });
      if (state.notifications.length > 100)
        state.notifications = state.notifications.slice(state.notifications.length - 100, state.notifications.length);
    },
    seenNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? {
              ...notification,
              seen: true,
            }
          : notification,
      );
    },
    interactedWithNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? {
              ...notification,
              seen: true,
              interacted: true,
            }
          : notification,
      );
    },
    clearExpiredNotifications: (state) => {
      const now = Date.now();
      state.notifications = state.notifications.map((notification) =>
        notification.timeout < now
          ? {
              ...notification,
              seen: true,
              read: true,
            }
          : notification,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markSeenAllNotifications: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        seen: true,
      }));
    },
    setPrevApiEndpoint: (state, action: PayloadAction<string | null>) => {
      state.previousStates.prevApiEndpoint = action.payload;
    },
    setPrevOutgoingChannels: (state, action: PayloadAction<ChannelsOutgoingType | null>) => {
      state.previousStates.prevOutgoingChannels = action.payload;
    },
    setPrevIncomingChannels: (state, action: PayloadAction<ChannelsIncomingType | null>) => {
      state.previousStates.prevIncomingChannels = action.payload;
    },
    setPrevNodeInfo: (state, action: PayloadAction<GetInfoResponseType | null>) => {
      state.previousStates.prevNodeInfo = action.payload;
    },
    setPrevNodeBalances: (state, action: PayloadAction<GetBalancesResponseType | null>) => {
      state.previousStates.prevNodeBalances = action.payload;
    },
  },
});

export const appActions = appSlice.actions;
export default appSlice.reducer;
