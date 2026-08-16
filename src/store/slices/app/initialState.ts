import type { GetBalancesResponseType, GetInfoResponseType } from '@hoprnet/hopr-sdk';
import { loadStateFromLocalStorage } from '../../../utils/localStorage';
import { ChannelsOutgoingType, ChannelsIncomingType } from '../node/initialState';

type InitialState = {
  notifications: {
    id: string;
    name: string;
    source: string;
    seen: boolean;
    interacted: boolean;
    timeout: number;
    url: string | null;
  }[];
  configuration: {
    notifications: {
      channels: boolean;
      nodeInfo: boolean;
      nodeBalances: boolean;
      message: boolean;
      pendingSafeTransaction: boolean;
    };
  };
  previousStates: {
    // The node the snapshots below were taken from. Snapshots are only
    // comparable against the same node, see resetNodeState / useWatcher.
    prevApiEndpoint: string | null;
    prevOutgoingChannels: ChannelsOutgoingType | null;
    prevIncomingChannels: ChannelsIncomingType | null;
    prevNodeInfo: GetInfoResponseType | null;
    prevNodeBalances: GetBalancesResponseType | null;
    prevMessagesUuids: string[];
  };
};

export const initialState: InitialState = {
  notifications: [],
  configuration: {
    notifications: (loadStateFromLocalStorage(
      'app/configuration/notifications',
    ) as InitialState['configuration']['notifications']) ?? {
      channels: true,
      message: true,
      nodeBalances: true,
      nodeInfo: true,
      pendingSafeTransaction: true,
    },
  },
  // previous states used to compare for notifications
  previousStates: {
    prevApiEndpoint: null,
    prevOutgoingChannels: null,
    prevIncomingChannels: null,
    prevMessagesUuids: [],
    prevNodeBalances: null,
    prevNodeInfo: null,
  },
};
