import { useAppDispatch, useAppSelector } from '../store';
import { fetchNodeData } from '../store/slices/node/fetchNodeData';
import { fetchBlokliData } from '../store/slices/blokli/fetchBlokliData';
import { selectBlokliUrl } from '../store/selectors/blokli';

/** Refetches everything the pages show, from the node and from blokli. */
export const useRefreshAll = () => {
  const dispatch = useAppDispatch();
  const { apiEndpoint, apiToken } = useAppSelector((store) => store.auth.loginData);
  const nodeApiEndpoint = useAppSelector((store) => store.node.apiEndpoint);
  const blokliUrl = useAppSelector(selectBlokliUrl);
  const nodeAddress = useAppSelector((store) => store.node.addresses.data.native);
  const safeAddress = useAppSelector((store) => store.node.info.data?.hoprNodeSafe);
  const isFetching = useAppSelector(
    (store) =>
      store.node.info.isFetching ||
      store.node.balances.isFetching ||
      store.node.channels.isFetching ||
      store.node.peersConnected.isFetching ||
      store.node.sessions.isFetching,
  );

  const refresh = () => {
    // fetchNodeData expects the formatted endpoint the node slice works with
    const endpoint = nodeApiEndpoint ?? apiEndpoint;
    if (!endpoint) return;
    fetchNodeData({ apiEndpoint: endpoint, apiToken, dispatch });
    fetchBlokliData({ blokliUrl, nodeAddress, safeAddress, dispatch });
  };

  return { refresh, isFetching };
};
