import type { AppDispatch } from '../..';
import { actionsAsync as nodeActionsAsync } from './actionsAsync';

/**
 * Fetches everything the node subpages read, so a node switch leaves whichever
 * page the user is on showing the new node instead of an empty table.
 *
 * Both login paths (the connect modal and login by url) go through here, which
 * keeps them from drifting apart. `apiEndpoint` must already be formatted with
 * `parseAndFormatUrl`: some thunks compare it against `store.node.apiEndpoint`
 * and silently drop their result when the two do not match.
 */
export const fetchNodeData = ({
  apiEndpoint,
  apiToken,
  dispatch,
}: {
  apiEndpoint: string;
  apiToken: string | null;
  dispatch: AppDispatch;
}) => {
  const payload = {
    apiEndpoint,
    apiToken: apiToken ? apiToken : '',
  };

  dispatch(nodeActionsAsync.isNodeReadyThunk(payload));
  dispatch(nodeActionsAsync.getInfoThunk(payload));
  dispatch(nodeActionsAsync.getAddressesThunk(payload));
  dispatch(nodeActionsAsync.getAnnouncedPeersThunk(payload));
  dispatch(nodeActionsAsync.getConnectedPeersThunk(payload));
  dispatch(nodeActionsAsync.getBalancesThunk(payload));
  dispatch(nodeActionsAsync.getChannelsThunk(payload));
  dispatch(nodeActionsAsync.getTicketStatisticsThunk(payload));
  dispatch(nodeActionsAsync.getConfigurationThunk(payload));
  dispatch(nodeActionsAsync.getPrometheusMetricsThunk(payload));
  dispatch(nodeActionsAsync.getTicketPriceThunk(payload));
  dispatch(nodeActionsAsync.getMinimumNetworkProbabilityThunk(payload));
  dispatch(nodeActionsAsync.getSessionsThunk(payload));
};
