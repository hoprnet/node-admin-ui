import styled from '@emotion/styled';
import { formatEther } from 'viem';
import { useAppSelector } from '../../store';
import { usePeerParam } from '../../hooks/usePeerParam';
import { HOPR_TOKEN_USED } from '../../../config';
import { v } from '../../theme';

// Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';
import { LastSeen } from '../../components/LastSeen';
import { Address, Amount } from '../../components/Data';
import RowActions from '../../components/Peer/RowActions';
import PeerPanel from '../../components/Peer/PeerPanel';
import WithdrawModal from '../../components/Modal/node/WithdrawModal';

const Summary = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface};
  overflow: hidden;
  .item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px;
    box-shadow: -1px 0 0 ${v.border}, 0 -1px 0 ${v.border};
    min-width: 0;
  }
  .label {
    font-size: 12.5px;
    color: ${v.text2};
  }
  .value {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.015em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    font-size: 12px;
    color: ${v.text3};
  }
`;

const SafeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${v.text2};
`;

const SectionTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
`;

/**
 * The safe of the connected node: its balances and allowance, and every node
 * registered to it. On-chain figures of the nodes come from blokli; missing ones
 * render as '-' and are never filled in from node data. Last seen is p2p
 * liveness the chain cannot know, so it comes from the connected node's peers.
 */
function SafePage() {
  const safeNodes = useAppSelector((store) => store.blokli.safeNodes);
  const balances = useAppSelector((store) => store.node.balances.data);
  const safeChannelsOut = useAppSelector((store) => store.blokli.channelStats.data);
  const peersObject = useAppSelector((store) => store.node.peersConnected.parsed.obj);
  const aliases = useAppSelector((store) => store.node.aliases);
  const myAddress = useAppSelector((store) => store.node.addresses.data.native);
  const safeAddress = useAppSelector((store) => store.node.info.data?.hoprNodeSafe);
  const { peer, open: openPeer, close: closePeer } = usePeerParam();

  const totalStaked =
    safeChannelsOut?.value && balances.safeHopr?.value
      ? formatEther(BigInt(safeChannelsOut.value) + BigInt(balances.safeHopr.value))
      : null;

  const rows = (safeNodes.data ?? []).map((safeNode) => {
    const nodeAddress = safeNode.nodeAddress;
    const alias = aliases?.[nodeAddress];
    return {
      id: nodeAddress,
      peerAddress: nodeAddress,
      peer: `${alias ?? ''} ${nodeAddress}`,
      node: (
        <Address
          address={nodeAddress}
          alias={nodeAddress === myAddress ? `${alias ?? 'This node'}` : alias ?? null}
        />
      ),
      xDaiValue: safeNode.xDai?.formatted ?? '',
      xDai: (
        <Amount
          value={safeNode.xDai?.formatted}
          unit="xDAI"
        />
      ),
      channelsCount: safeNode.channels ? safeNode.channels.count : '-',
      channelsValue: safeNode.channels?.formatted ?? '',
      channelsFunds: (
        <Amount
          value={safeNode.channels?.formatted}
          unit={HOPR_TOKEN_USED}
          decimals={2}
        />
      ),
      redeemedValue: safeNode.redeemed?.formatted ?? '',
      redeemed: (
        <Amount
          value={safeNode.redeemed?.formatted}
          unit={HOPR_TOKEN_USED}
          decimals={2}
        />
      ),
      lastUpdate: peersObject[nodeAddress]?.lastUpdate ?? 0,
      lastSeen: (
        <LastSeen
          timestamp={peersObject[nodeAddress]?.lastUpdate ?? 0}
          self={nodeAddress === myAddress}
        />
      ),
      actions:
        nodeAddress === myAddress ? (
          <span />
        ) : (
          <RowActions
            address={nodeAddress}
            onDetails={() => openPeer(nodeAddress)}
          />
        ),
    };
  });

  const header = [
    { key: 'node', name: 'Node', sortKey: 'peer' },
    { key: 'peer', name: 'Node', search: true, hidden: true },
    { key: 'xDai', name: 'xDAI', sortKey: 'xDaiValue', align: 'right' as const, width: '140px' },
    { key: 'channelsCount', name: 'Channels', align: 'right' as const, width: '100px' },
    { key: 'channelsFunds', name: 'In channels', sortKey: 'channelsValue', align: 'right' as const, width: '160px' },
    { key: 'redeemed', name: 'Redeemed', sortKey: 'redeemedValue', align: 'right' as const, width: '150px' },
    { key: 'lastSeen', name: 'Last seen', sortKey: 'lastUpdate', width: '150px' },
    { key: 'actions', name: '', width: '56px' },
  ];

  return (
    <Section
      className="Section--safe"
      id="Section--safe"
      fullHeightMin
    >
      <SubpageTitle
        title="Safe"
        description={
          safeAddress ? (
            <SafeHeader>
              <Address
                address={safeAddress}
                alias={null}
                icon={false}
                full
              />
            </SafeHeader>
          ) : undefined
        }
        actions={<WithdrawModal />}
      />
      <Summary>
        <div className="item">
          <span className="label">wxHOPR in safe</span>
          <span className="value">
            <Amount
              value={balances.safeHopr?.formatted}
              unit={HOPR_TOKEN_USED}
              decimals={2}
            />
          </span>
        </div>
        <div className="item">
          <span className="label">Staked in channels</span>
          <span className="value">
            <Amount
              value={safeChannelsOut?.formatted}
              unit={HOPR_TOKEN_USED}
              decimals={2}
            />
          </span>
          {safeChannelsOut && <span className="sub">{safeChannelsOut.count} channels, all nodes</span>}
        </div>
        <div className="item">
          <span className="label">Total</span>
          <span className="value">
            <Amount
              value={totalStaked}
              unit={HOPR_TOKEN_USED}
              decimals={2}
            />
          </span>
        </div>
        <div className="item">
          <span className="label">Node allowance</span>
          <span className="value">
            <Amount
              value={balances.safeHoprAllowance?.formatted}
              unit={HOPR_TOKEN_USED}
              decimals={2}
            />
          </span>
          <span className="sub">What this node may spend from the safe</span>
        </div>
        <div className="item">
          <span className="label">xDAI in safe</span>
          <span className="value">
            <Amount
              value={balances.safeNative?.formatted}
              unit="xDAI"
            />
          </span>
        </div>
      </Summary>
      <SectionTitle>Nodes of this safe</SectionTitle>
      <TablePro
        data={rows}
        id="safe-nodes-table"
        header={header}
        search
        loading={rows.length === 0 && safeNodes.isFetching}
        emptyText="No nodes found for this safe (needs blokli)"
        orderByDefault="node"
        onRowClick={(row: { peerAddress: string }) => row.peerAddress !== myAddress && openPeer(row.peerAddress)}
        activeRowId={peer}
      />
      <PeerPanel
        address={peer}
        onClose={closePeer}
      />
    </Section>
  );
}

export default SafePage;
