import type { ChannelStatsType, TicketRedemptionType } from '../../../blokli';

type InitialState = {
  // the node these figures belong to, used to drop results after a node switch
  nodeAddress: string | null;
  // blokli url override saved for this node, null means use the one the node reports
  url: string | null;
  channelStats: {
    data: ChannelStatsType | null;
    isFetching: boolean;
  };
  ticketRedemption: {
    data: TicketRedemptionType | null;
    isFetching: boolean;
  };
};

export const initialState: InitialState = {
  nodeAddress: null,
  url: null,
  channelStats: {
    data: null,
    isFetching: false,
  },
  ticketRedemption: {
    data: null,
    isFetching: false,
  },
};
