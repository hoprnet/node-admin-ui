import type {
  GetTicketStatisticsResponseType,
  GetChannelsResponseType,
  GetInfoResponseType,
  GetAnnouncedResponseType,
  GetConnectedResponseType,
  PingPeerResponseType,
  GetConfigurationResponseType,
  GetMinimumNetworkProbabilityResponseType,
  GetSessionsResponseType,
} from '@hoprnet/hopr-sdk';

export type Message = {
  id: string;
  timestamp?: number;
  receivedAt?: number;
  body: string;
  notified?: boolean;
  seen?: boolean;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
  challenge?: string;
  receiver?: string;
  tag?: number;
};

export type ChannelOutgoingType = {
  status?: 'Open' | 'PendingToClose' | 'Closed';
  balance?: string;
  peerAddress?: string;
  isClosing?: boolean;
};

export type ChannelIncomingType = {
  status?: 'Open' | 'PendingToClose' | 'Closed';
  balance?: string;
  peerAddress?: string;
  tickets: number;
  ticketBalance: string;
  isClosing?: boolean;
};

export type ChannelsOutgoingType = {
  [channelId: string]: ChannelOutgoingType;
};

export type ChannelsIncomingType = {
  [channelId: string]: ChannelIncomingType;
};

export type AddressesType = { native: string | null };

export type ParsedStrategiesType = {
  [key: string]: {
    [key: string]: string | number | boolean;
  };
};

type WebsocketConnectionStatus = 'connecting' | 'connected' | 'error' | null;

export type PacketCounter = {
  data: string | null;
  timestamp: number | null;
};

export type PacketAverages = {
  now: number | null;
  oneMin: number | null;
  fiveMin: number | null;
  fifteenMin: number | null;
};

export type PacketStats = {
  history: PacketCounter[];
  averages: PacketAverages;
};

type InitialState = {
  info: {
    data: GetInfoResponseType | null;
    isFetching: boolean;
  };
  status: {
    initiating: boolean;
    initiated: boolean;
  };
  addresses: {
    data: AddressesType;
    isFetching: boolean;
  };
  aliases: {
    [peerAddress: string]: string;
  };
  balances: {
    data: {
      hopr: {
        value: string | null;
        formatted: string | null;
      };
      native: {
        value: string | null;
        formatted: string | null;
      };
      safeHopr: {
        value: string | null;
        formatted: string | null;
      };
      safeNative: {
        value: string | null;
        formatted: string | null;
      };
      safeHoprAllowance: {
        value: string | null;
        formatted: string | null;
      };
      channels: {
        value: string | null;
        formatted: string | null;
      };
    };
    isFetching: boolean;
    alreadyFetched: boolean;
  };
  channels: {
    data: GetChannelsResponseType | null;
    parsed: {
      incoming: ChannelsIncomingType;
      outgoing: ChannelsOutgoingType;
      outgoingOpening: {
        [peerAddress: string]: boolean;
      };
    };
    corrupted: {
      data: string[];
      isFetching: boolean;
    };
    isFetching: boolean;
    alreadyFetched: boolean;
  };
  checks: {
    peers: {
      [peerAddress: string]: boolean;
    };
    channelsIn: {
      [channelsId: string]: boolean;
    };
    channelsOut: {
      [channelsId: string]: boolean;
    };
    sessions: {
      [session: string]: boolean;
    };
  };
  configuration: {
    data: GetConfigurationResponseType | null;
    parsedStrategies: ParsedStrategiesType;
    isFetching: boolean;
  };
  links: {
    peerAddressToOutgoingChannel: {
      [peerAddress: string]: string;
    };
    peerAddressToIncomingChannel: {
      [peerAddress: string]: string;
    };
    incomingChannelTopeerAddress: {
      [channelId: string]: string;
    };
    aliasTopeerAddress: {
      [alias: string]: string;
    };
    sortedAliases: string[];
    peerAddressesWithAliases: string[];
  };
  messages: {
    data: Message[];
    isFetching: boolean;
    isDeleting: boolean;
  };
  messagesSent: Message[];
  signedMessages: { timestamp: number; body: string }[];
  peersAnnounced: {
    data: GetAnnouncedResponseType | null;
    parsed: {
      obj: {
        [address: string]: GetAnnouncedResponseType[number];
      };
      sorted: string[];
    };
    isFetching: boolean;
    alreadyFetched: boolean;
  };
  peersConnected: {
    data: GetConnectedResponseType | null;
    parsed: {
      obj: {
        [address: string]: GetConnectedResponseType[number];
      };
      sorted: string[];
    };
    isFetching: boolean;
    alreadyFetched: boolean;
  };
  probability: { data: number | null; isFetching: boolean };
  statistics: { data: GetTicketStatisticsResponseType | null; isFetching: boolean };
  version: { data: string | null; isFetching: boolean };
  transactions: { data: string[]; isFetching: boolean };
  pings: (PingPeerResponseType & { peerAddress: string })[];
  metrics: {
    data: {
      raw: string | null;
      parsed: {
        [key: string]: {
          categories: string[];
          data: unknown[];
          length: number;
          name: string;
          type: string;
        };
      };
    };
    isFetching: boolean;
  };
  metricsParsed: {
    nodeSync: number | null;
    tickets: {
      incoming: {
        redeemed: {
          [peerAddress: string]: {
            value: string;
            formatted: string;
          };
        };
        unredeemed: {
          [peerAddress: string]: {
            value: string;
            formatted: string;
          };
        };
      };
    };
    packets: {
      sent: PacketStats;
      received: PacketStats;
      forwarded: PacketStats;
    };
    nodeStartEpoch: number | null;
    checksum: string | null;
    blockNumber: number | null;
    indexerDataSource: string | null;
  };
  messagesWebsocketStatus: WebsocketConnectionStatus;
  redeemAllTickets: {
    isFetching: boolean;
    error: string | undefined;
  };
  resetTicketStatistics: {
    isFetching: boolean;
    error: string | undefined;
  };
  ticketPrice: {
    data: string | null;
    isFetching: boolean;
  };
  sessions: {
    data: GetSessionsResponseType | null;
    opening: string[];
    closing: string[];
    isFetching: boolean;
  };
  apiEndpoint: string | null;
  nodeIsReady: {
    data: boolean | null;
    isFetching: boolean;
  };
};

export const initialState: InitialState = {
  info: {
    data: null,
    isFetching: false,
  },
  status: {
    initiating: false,
    initiated: false,
  },
  addresses: {
    data: {
      native: null,
    },
    isFetching: false,
  },
  aliases: {},
  balances: {
    data: {
      hopr: {
        value: null,
        formatted: null,
      },
      native: {
        value: null,
        formatted: null,
      },
      safeHopr: {
        value: null,
        formatted: null,
      },
      safeNative: {
        value: null,
        formatted: null,
      },
      safeHoprAllowance: {
        value: null,
        formatted: null,
      },
      channels: {
        value: null,
        formatted: null,
      },
    },
    isFetching: false,
    alreadyFetched: false,
  },
  channels: {
    data: null,
    parsed: {
      incoming: {},
      outgoing: {},
      outgoingOpening: {},
    },
    corrupted: {
      data: [],
      isFetching: false,
    },
    isFetching: false,
    alreadyFetched: false,
  },
  checks: {
    peers: {},
    channelsIn: {},
    channelsOut: {},
    sessions: {},
  },
  configuration: {
    data: null,
    parsedStrategies: {},
    isFetching: false,
  },
  messages: {
    data: [],
    isFetching: false,
    isDeleting: false,
  },
  messagesSent: [],
  signedMessages: [],
  peersAnnounced: {
    data: null,
    parsed: {
      obj: {},
      sorted: [],
    },
    isFetching: false,
    alreadyFetched: false,
  },
  peersConnected: {
    data: null,
    parsed: {
      obj: {},
      sorted: [],
    },
    isFetching: false,
    alreadyFetched: false,
  },
  probability: { data: null, isFetching: false },
  statistics: {
    data: null,
    isFetching: false,
  },
  version: {
    data: null,
    isFetching: false,
  },
  transactions: {
    data: [],
    isFetching: false,
  },
  pings: [],
  metrics: {
    data: {
      raw: null,
      parsed: {},
    },
    isFetching: false,
  },
  metricsParsed: {
    nodeSync: null,
    tickets: {
      incoming: {
        redeemed: {},
        unredeemed: {},
      },
    },
    packets: {
      sent: { history: [], averages: { now: null, oneMin: null, fiveMin: null, fifteenMin: null } },
      received: { history: [], averages: { now: null, oneMin: null, fiveMin: null, fifteenMin: null } },
      forwarded: { history: [], averages: { now: null, oneMin: null, fiveMin: null, fifteenMin: null } },
    },
    nodeStartEpoch: null,
    checksum: null,
    blockNumber: null,
    indexerDataSource: null,
  },
  messagesWebsocketStatus: null,
  redeemAllTickets: {
    isFetching: false,
    error: undefined,
  },
  resetTicketStatistics: {
    isFetching: false,
    error: undefined,
  },
  ticketPrice: {
    data: null,
    isFetching: false,
  },
  sessions: {
    data: null,
    opening: [],
    closing: [],
    isFetching: false,
  },
  links: {
    peerAddressToOutgoingChannel: {},
    peerAddressToIncomingChannel: {},
    incomingChannelTopeerAddress: {},
    aliasTopeerAddress: {},
    sortedAliases: [],
    peerAddressesWithAliases: [],
  },
  apiEndpoint: null,
  nodeIsReady: {
    data: null,
    isFetching: false,
  },
};
