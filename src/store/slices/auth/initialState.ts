import { isAddress } from 'viem';
import { loadStateFromLocalStorage } from '../../../utils/localStorage';

type SavedNode = {
  apiEndpoint: string | null;
  apiToken: string | null;
  localName: string | null;
  jazzIcon?: string | null;
  network?: string | null;
  nodeAddress?: string | null;
};

export const loadSavedNodes = (): SavedNode[] =>
  ((loadStateFromLocalStorage('admin-ui-node-list') as SavedNode[] | null) ?? []).map((node) =>
    // nodes saved before nodeAddress existed still carry the node address in jazzIcon
    !node.nodeAddress && node.jazzIcon && isAddress(node.jazzIcon) ? { ...node, nodeAddress: node.jazzIcon } : node,
  );

type InitialState = {
  status: {
    connecting: boolean;
    connected: boolean;
    error: {
      data: string | null;
      type: 'API_ERROR' | 'CUSTOM_ERROR' | 'FETCH_ERROR';
    } | null;
  };
  loginData: {
    apiEndpoint: string | null;
    apiToken: string | null;
    localName: string | null;
    peerAddress: string | null;
    jazzIcon: string | null;
  };
  nodes: SavedNode[];
  helper: {
    openLoginModalToNode: boolean;
  };
};

export const initialState: InitialState = {
  status: {
    connecting: false,
    connected: false,
    error: null,
  },
  loginData: {
    apiEndpoint: null,
    apiToken: null,
    localName: null,
    peerAddress: null,
    jazzIcon: null,
  },
  nodes: loadSavedNodes(),
  helper: { openLoginModalToNode: false },
};
