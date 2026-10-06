import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { nodeActions } from '../../store/slices/node';
import { exportToCsv } from '../../utils/helpers';
import { usePeerParam } from '../../hooks/usePeerParam';

// Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';
import ProgressBar from '../../future-hopr-lib-components/Progressbar';
import { LastSeen } from '../../components/LastSeen';
import { Address, Segmented, StatusPill } from '../../components/Data';
import RowActions from '../../components/Peer/RowActions';
import PeerPanel from '../../components/Peer/PeerPanel';
import CSVUploader from '../../components/CSVUploader';
import { PingModal } from '../../components/Modal/node/PingModal';
import { CreateAliasModal } from '../../components/Modal/node/AddAliasModal';

// Mui
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { IconButton as MuiIconButton, Tooltip } from '@mui/material';

type View = 'connected' | 'book';

function PeersPage() {
  const dispatch = useAppDispatch();
  const [searchParams, set_searchParams] = useSearchParams();
  const view: View = searchParams.get('view') === 'book' ? 'book' : 'connected';
  const { peer, open: openPeer, close: closePeer } = usePeerParam();

  const peersConnected = useAppSelector((store) => store.node.peersConnected.data);
  const peersObject = useAppSelector((store) => store.node.peersConnected.parsed.obj);
  const peersFetching = useAppSelector((store) => store.node.peersConnected.isFetching);
  const aliases = useAppSelector((store) => store.node.aliases);
  const ownAliases = useAppSelector((store) => store.node.aliasesOwn);
  const myAddress = useAppSelector((store) => store.node.addresses.data.native);

  const setView = (next: View) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'book') params.set('view', 'book');
    else params.delete('view');
    params.delete('peer');
    set_searchParams(params);
  };

  // ---- connected peers
  const connectedRows = (peersConnected ?? []).map((p) => {
    const alias = aliases?.[p.address];
    return {
      id: p.address,
      peerAddress: p.address,
      node: (
        <Address
          address={p.address}
          alias={alias ?? null}
        />
      ),
      peer: `${alias ?? ''} ${p.address}`,
      lastSeen: <LastSeen timestamp={p.lastUpdate} />,
      lastUpdate: p.lastUpdate,
      score: <ProgressBar value={p.score} />,
      scoreValue: p.score,
      latency: (
        <span className="mono">
          {p.averageLatency !== null && p.averageLatency !== undefined ? `${p.averageLatency} ms` : '-'}
        </span>
      ),
      latencyValue: p.averageLatency ?? Number.MAX_SAFE_INTEGER,
      actions: (
        <RowActions
          address={p.address}
          onDetails={() => openPeer(p.address)}
        />
      ),
    };
  });

  const connectedHeader = [
    { key: 'node', name: 'Peer', sortKey: 'peer' },
    { key: 'peer', name: 'Peer', search: true, hidden: true },
    { key: 'score', name: 'Quality', sortKey: 'scoreValue', width: '140px' },
    { key: 'latency', name: 'Latency', sortKey: 'latencyValue', align: 'right' as const, width: '110px' },
    { key: 'lastSeen', name: 'Last update', sortKey: 'lastUpdate', width: '170px' },
    { key: 'actions', name: '', width: '56px' },
  ];

  // ---- address book (aliases)
  const bookRows = Object.keys(aliases ?? {}).map((address) => {
    const connected = !!peersObject[address];
    const own = !!ownAliases?.[address];
    return {
      id: address,
      peerAddress: address,
      node: (
        <Address
          address={address}
          alias={aliases[address]}
        />
      ),
      peer: `${aliases[address]} ${address}`,
      alias: aliases[address],
      status: (
        <StatusPill tone={address === myAddress ? 'accent' : connected ? 'success' : 'neutral'}>
          {address === myAddress ? 'This node' : connected ? 'Connected' : 'Not connected'}
        </StatusPill>
      ),
      statusText: connected ? 'connected' : 'not connected',
      source: own ? 'This node' : 'Other saved node',
      actions: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Tooltip title={own ? 'Delete alias' : 'Delete alias (stored with another saved node)'}>
            <MuiIconButton
              size="small"
              aria-label="Delete alias"
              onClick={(event) => {
                event.stopPropagation();
                dispatch(nodeActions.removeAlias(address));
              }}
            >
              <DeleteIcon fontSize="small" />
            </MuiIconButton>
          </Tooltip>
          <RowActions
            address={address}
            onDetails={() => openPeer(address)}
          />
        </span>
      ),
    };
  });

  const bookHeader = [
    { key: 'node', name: 'Peer', sortKey: 'peer' },
    { key: 'peer', name: 'Peer', search: true, hidden: true },
    { key: 'status', name: 'Status', sortKey: 'statusText', width: '160px' },
    { key: 'source', name: 'Saved on', width: '170px' },
    { key: 'actions', name: '', width: '96px' },
  ];

  const handleExport = () => {
    if (view === 'connected') {
      exportToCsv(
        (peersConnected ?? []).map((p) => ({
          peerAddress: p.address,
          alias: aliases?.[p.address] ?? '',
          score: p.score,
          lastUpdate: p.lastUpdate,
          averageLatency: p.averageLatency,
          probeRate: p.probeRate,
        })),
        'peers.csv',
      );
    } else {
      exportToCsv(
        Object.keys(aliases ?? {}).map((address) => ({ address, alias: aliases[address] })),
        `aliases-${myAddress}.csv`,
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCSVUpload = (parsedData: any[]) => {
    for (const data of parsedData) {
      dispatch(nodeActions.setAlias({ peerAddress: data.address || data.peerAddress, alias: data.alias }));
    }
  };

  const rows = view === 'connected' ? connectedRows : bookRows;

  return (
    <Section
      className="Section--peers"
      id="Section--peers"
      fullHeightMin
    >
      <SubpageTitle
        title="Peers"
        count={peersConnected ? peersConnected.length : null}
        actions={
          <>
            <PingModal />
            {view === 'book' && <CreateAliasModal />}
            {view === 'book' && (
              <CSVUploader
                onParse={handleCSVUpload}
                tooltip="Import aliases from a CSV"
              />
            )}
            <IconButton
              iconComponent={<GetAppIcon />}
              tooltipText={view === 'connected' ? 'Export peers as CSV' : 'Export aliases as CSV'}
              disabled={rows.length === 0}
              onClick={handleExport}
            />
          </>
        }
      />
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'connected', label: 'Connected', count: peersConnected ? peersConnected.length : null },
          { value: 'book', label: 'Address book', count: Object.keys(aliases ?? {}).length },
        ]}
      />
      <TablePro
        key={view}
        data={rows}
        id={`node-peers-${view}-table`}
        header={view === 'connected' ? connectedHeader : bookHeader}
        search
        loading={view === 'connected' && rows.length === 0 && peersFetching}
        emptyText={view === 'connected' ? 'No connected peers' : 'No aliases yet. Set one from a peer’s menu.'}
        orderByDefault="node"
        onRowClick={(row: { peerAddress: string }) => openPeer(row.peerAddress)}
        activeRowId={peer}
      />
      <PeerPanel
        address={peer}
        onClose={closePeer}
      />
    </Section>
  );
}

export default PeersPage;
