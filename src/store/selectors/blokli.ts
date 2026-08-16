import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';

/**
 * The url the node reports is the default, store.blokli.url is the per node override.
 */
export const selectBlokliUrl = (state: RootState): string | null =>
  state.blokli.url ?? state.node.info.data?.providerUrl ?? null;

/**
 * wxHOPR held in open outgoing channels.
 *
 * Prefers the blokli figure, which covers every node registered to the safe, and falls
 * back to the connected node's own channels when blokli is unavailable or the node has
 * no safe. Read this everywhere instead of store.node.balances.data.channels so the
 * info page, the total staked row and the sidebar cannot disagree.
 *
 * Memoized because it builds an object: useSelector compares by reference, so an
 * unmemoized version would re-render every consumer on any store change.
 */
export const selectChannelsOutBalance = createSelector(
  [(state: RootState) => state.blokli.channelStats.data, (state: RootState) => state.node.balances.data.channels],
  (blokliChannels, nodeChannels): { value: string; formatted: string; count: number | null; fromBlokli: boolean } => {
    if (blokliChannels) {
      return {
        value: blokliChannels.value,
        formatted: blokliChannels.formatted,
        count: blokliChannels.count,
        fromBlokli: true,
      };
    }
    return {
      value: nodeChannels?.value ?? '',
      formatted: nodeChannels?.formatted ?? '',
      count: null,
      fromBlokli: false,
    };
  },
);
