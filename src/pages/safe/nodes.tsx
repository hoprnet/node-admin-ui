import { useAppDispatch, useAppSelector } from '../../store';
import { blokliActionsAsync } from '../../store/slices/blokli';
import { selectBlokliUrl } from '../../store/selectors/blokli';

// HOPR Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';
import PeersInfo from '../../future-hopr-lib-components/PeerInfo';
import { LastSeen } from '../../components/LastSeen';

// Modals
import { PingModal } from '../../components/Modal/node/PingModal';
import { CreateAliasModal } from '../../components/Modal/node/AddAliasModal';
import { OpenChannelModal } from '../../components/Modal/node/OpenChannelModal';
import { FundChannelModal } from '../../components/Modal/node/FundChannelModal';
import { OpenSessionModal } from '../../components/Modal/node/OpenSessionModal';

/**
 * Nodes registered to the same safe as the connected node. All on-chain figures
 * come from blokli, missing ones render as '-' and are never filled in from node
 * data. Last seen is p2p liveness the chain cannot know, so it comes from the
 * connected node's peer data like on the aliases page.
 */
function SafeNodesPage() {
  const dispatch = useAppDispatch();
  const safeNodes = useAppSelector((store) => store.blokli.safeNodes);
  const aliases = useAppSelector((store) => store.node.aliases);
  const peersObject = useAppSelector((store) => store.node.peersConnected.parsed.obj);
  const mypeerAddress = useAppSelector((store) => store.node.addresses.data.native);
  const hoprNodeSafe = useAppSelector((store) => store.node.info.data?.hoprNodeSafe);
  const peerAddressToOutgoingChannelLink = useAppSelector((store) => store.node.links.peerAddressToOutgoingChannel);
  const blokliUrl = useAppSelector(selectBlokliUrl);

  const handleRefresh = () => {
    if (!blokliUrl || !mypeerAddress || !hoprNodeSafe) return;
    dispatch(
      blokliActionsAsync.getSafeNodesThunk({
        blokliUrl,
        nodeAddress: mypeerAddress,
        safeAddress: hoprNodeSafe,
      }),
    );
  };

  const parsedTableData = (safeNodes.data ?? []).map((safeNode, index) => {
    const nodeAddress = safeNode.nodeAddress;
    return {
      id: nodeAddress,
      key: index.toString(),
      alias: aliases?.[nodeAddress] ?? '',
      node: <PeersInfo peerAddress={nodeAddress} />,
      peerAddress: nodeAddress,
      xDai: safeNode.xDai ? `${safeNode.xDai.formatted} xDai` : '-',
      channelsCount: safeNode.channels ? safeNode.channels.count : '-',
      channelsFunds: safeNode.channels ? `${safeNode.channels.formatted} wxHOPR` : '-',
      redeemed: safeNode.redeemed ? `${safeNode.redeemed.formatted} wxHOPR` : '-',
      lastSeen: (
        <LastSeen
          timestamp={peersObject[nodeAddress]?.lastUpdate ?? 0}
          self={nodeAddress === mypeerAddress}
        />
      ),
      actions: (
        <>
          <PingModal
            address={nodeAddress}
            disabled={nodeAddress === mypeerAddress}
            tooltip={nodeAddress === mypeerAddress ? `You can't ping yourself` : undefined}
          />
          <CreateAliasModal address={nodeAddress} />
          {peerAddressToOutgoingChannelLink[nodeAddress] ? (
            <FundChannelModal address={nodeAddress} />
          ) : (
            <OpenChannelModal
              peerAddress={nodeAddress}
              disabled={nodeAddress === mypeerAddress}
              tooltip={nodeAddress === mypeerAddress ? `You can't open a channel to yourself` : undefined}
            />
          )}
          <OpenSessionModal destination={nodeAddress} />
        </>
      ),
    };
  });

  const header = [
    {
      key: 'alias',
      name: 'Alias',
      search: true,
      hidden: true,
    },
    {
      key: 'node',
      name: 'Node',
      maxWidth: '350px',
    },
    {
      key: 'peerAddress',
      name: 'Node Address',
      search: true,
      hidden: true,
    },
    {
      key: 'xDai',
      name: 'xDai',
      tooltip: true,
      maxWidth: '80px',
    },
    {
      key: 'channelsCount',
      name: 'Channels',
      maxWidth: '45px',
    },
    {
      key: 'channelsFunds',
      name: 'Channels total',
      tooltip: true,
      maxWidth: '90px',
    },
    {
      key: 'redeemed',
      name: 'Redeemed',
      tooltip: true,
      maxWidth: '90px',
    },
    {
      key: 'lastSeen',
      name: 'Last seen',
      maxWidth: '20px',
    },
    {
      key: 'actions',
      name: 'Actions',
      search: false,
      width: '160px',
      maxWidth: '160px',
    },
  ];

  return (
    <Section
      className="Section--safe-nodes"
      id="Section--safe-nodes"
      fullHeightMin
      yellow
    >
      <SubpageTitle
        title={safeNodes.data ? `NODES (${parsedTableData.length})` : 'NODES'}
        refreshFunction={handleRefresh}
        reloading={safeNodes.isFetching}
      />
      <TablePro
        data={parsedTableData}
        id={'safe-nodes-table'}
        search={true}
        header={header}
        loading={safeNodes.data === null && safeNodes.isFetching}
        orderByDefault="peerAddress"
      />
    </Section>
  );
}

export default SafeNodesPage;
