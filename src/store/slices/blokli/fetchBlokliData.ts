import type { AppDispatch } from '../..';
import { actionsAsync as blokliActionsAsync } from './actionsAsync';

/**
 * Fetches everything we read from blokli for the connected node.
 *
 * All three inputs arrive asynchronously after a node switch - the url from local
 * storage, the safe address only once getInfo resolves - so callers pass them in and
 * this bails out until they are all there.
 */
export const fetchBlokliData = ({
  blokliUrl,
  nodeAddress,
  safeAddress,
  dispatch,
}: {
  blokliUrl: string | null | undefined;
  nodeAddress: string | null | undefined;
  safeAddress: string | null | undefined;
  dispatch: AppDispatch;
}) => {
  if (!blokliUrl || !nodeAddress) return;

  dispatch(
    blokliActionsAsync.getTicketRedemptionStatsThunk({
      blokliUrl,
      nodeAddress,
    }),
  );

  if (!safeAddress) return;
  dispatch(
    blokliActionsAsync.getChannelStatsThunk({
      blokliUrl,
      nodeAddress,
      safeAddress,
    }),
  );
  dispatch(
    blokliActionsAsync.getSafeNodesThunk({
      blokliUrl,
      nodeAddress,
      safeAddress,
    }),
  );
};
