import type { RootState } from '..';

/**
 * The url the node reports is the default, store.blokli.url is the per node override.
 */
export const selectBlokliUrl = (state: RootState): string | null =>
  state.blokli.url ?? state.node.info.data?.providerUrl ?? null;
