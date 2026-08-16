import { isAddress, getAddress } from 'viem';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from './localStorage';

export type AliasMap = {
  [peerAddress: string]: string;
};

export type AliasMergeMode = 'network' | 'all' | 'none';

type SavedNode = {
  apiEndpoint: string | null;
  apiToken: string | null;
  localName: string | null;
  jazzIcon?: string | null;
  network?: string | null;
  nodeAddress?: string | null;
};

const aliasesKey = (nodeAddress: string) => `node/aliases/${getAddress(nodeAddress)}`;

export function loadNodeAliases(nodeAddress: string | null): AliasMap {
  if (!nodeAddress || !isAddress(nodeAddress)) return {};
  return (loadStateFromLocalStorage(aliasesKey(nodeAddress)) as AliasMap | null) ?? {};
}

export function saveNodeAliases(nodeAddress: string | null, aliases: AliasMap) {
  if (!nodeAddress || !isAddress(nodeAddress)) return;
  saveStateToLocalStorage(aliasesKey(nodeAddress), aliases);
}

export function getAliasMergeMode(): AliasMergeMode {
  const stored = loadStateFromLocalStorage('app/configuration/aliases') as { mergeMode?: AliasMergeMode } | null;
  return stored?.mergeMode ?? 'network';
}

/**
 * Aliases keep being saved per node under `node/aliases/<nodeAddress>`, but they are displayed
 * merged: either across every saved node on the same network, or across every saved node.
 * When 2 nodes hold a different alias for the same peer address, nodes are sorted A-Z by name
 * and the first one wins.
 */
export function computeMergedAliases({
  ownAddress,
  ownAliases,
  ownNetwork,
}: {
  ownAddress: string | null;
  ownAliases: AliasMap;
  ownNetwork: string | null;
}): { merged: AliasMap; source: { [peerAddress: string]: string } } {
  const own = ownAddress && isAddress(ownAddress) ? getAddress(ownAddress) : null;

  const onlyOwn = () => {
    const merged: AliasMap = { ...ownAliases };
    const source: { [peerAddress: string]: string } = {};
    if (own) Object.keys(merged).forEach((peerAddress) => (source[peerAddress] = own));
    return {
      merged,
      source,
    };
  };

  const mergeMode = getAliasMergeMode();
  if (mergeMode === 'none' || !own) return onlyOwn();
  // Without knowing our own network we cannot tell which nodes share it
  if (mergeMode === 'network' && !ownNetwork) return onlyOwn();

  const savedNodes = (loadStateFromLocalStorage('admin-ui-node-list') as SavedNode[] | null) ?? [];

  const candidates = savedNodes
    .filter((node) => node.nodeAddress && isAddress(node.nodeAddress))
    .filter((node) => mergeMode === 'all' || node.network === ownNetwork)
    .map((node) => ({
      nodeAddress: getAddress(node.nodeAddress as string),
      name: node.localName || node.apiEndpoint || '',
    }));

  // The connected node always takes part, even when it was never saved locally.
  // It has no name to sort by then, so it ends up first and wins any conflict.
  if (!candidates.some((node) => node.nodeAddress === own)) {
    candidates.push({
      nodeAddress: own,
      name: '',
    });
  }

  // `bubbleSortObject` only runs when a node is inserted, so the saved order is not
  // reliably alphabetical - sort here to keep the winner deterministic.
  candidates.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const merged: AliasMap = {};
  const source: { [peerAddress: string]: string } = {};
  const alreadyMerged = new Set<string>();

  candidates.forEach((node) => {
    // the same node can be saved under 2 different api endpoints
    if (alreadyMerged.has(node.nodeAddress)) return;
    alreadyMerged.add(node.nodeAddress);

    const aliases = node.nodeAddress === own ? ownAliases : loadNodeAliases(node.nodeAddress);
    Object.keys(aliases).forEach((peerAddress) => {
      if (merged[peerAddress]) return; // first node A-Z wins
      merged[peerAddress] = aliases[peerAddress];
      source[peerAddress] = node.nodeAddress;
    });
  });

  return {
    merged,
    source,
  };
}
