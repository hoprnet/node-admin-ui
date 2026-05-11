import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { exportToCsv } from '../../utils/helpers';

// HOPR Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import { CreateAliasModal } from '../../components/Modal/node//AddAliasModal';
import { OpenChannelModal } from '../../components/Modal/node/OpenChannelModal';
import { FundChannelModal } from '../../components/Modal/node/FundChannelModal';
//import { SendMessageModal } from '../../components/Modal/node/SendMessageModal.tsx_';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';
import ProgressBar from '../../future-hopr-lib-components/Progressbar';
import PeersInfo from '../../future-hopr-lib-components/PeerInfo';

//  Modals
import { PingModal } from '../../components/Modal/node/PingModal';
import { OpenSessionModal } from '../../components/Modal/node/OpenSessionModal';

//Mui
import GetAppIcon from '@mui/icons-material/GetApp';

function PeersPage() {
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((store) => store.auth.loginData);
  const peersConnected = useAppSelector((store) => store.node.peersConnected.data);
  const peersFetching = useAppSelector((store) => store.node.peersConnected.isFetching);
  const aliases = useAppSelector((store) => store.node.aliases);
  const nodeAddressToOutgoingChannelLink = useAppSelector((store) => store.node.links.nodeAddressToOutgoingChannel);

  useEffect(() => {
    handleRefresh();
  }, [loginData, dispatch]);

  const handleRefresh = () => {
    if (!loginData.apiEndpoint) return;

    dispatch(
      actionsAsync.getConnectedPeersThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ? loginData.apiToken : '',
      }),
    );
    dispatch(
      actionsAsync.getAnnouncedPeersThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ? loginData.apiToken : '',
      }),
    );
  };

  const getAliasByAddress = (address: string): string => {
    if (aliases && address && aliases[address]) return `${aliases[address]} (${address})`;
    return address;
  };

  const handleExport = () => {
    if (peersConnected && peersConnected.length > 0) {
      exportToCsv(
        peersConnected.map((peer) => ({
          nodeAddress: peer.address,
          score: peer.score,
          lastUpdate: peer.lastUpdate,
          averageLatency: peer.averageLatency,
          probeRate: peer.probeRate,
        })),
        'peers.csv',
      );
    }
  };

  const header = [
    {
      key: 'id',
      name: '#',
      maxWidth: '5px',
    },
    {
      key: 'node',
      name: 'Node',
      maxWidth: '300px',
    },
    {
      key: 'address',
      name: 'Node Address',
      search: true,
      hidden: true,
    },
    {
      key: 'lastUpdate',
      name: 'Last update',
      tooltip: true,
      width: '120px',
      maxWidth: '120px',
    },
    {
      key: 'score',
      name: 'Score',
      width: '90px',
      maxWidth: '90px',
    },
    {
      key: 'actions',
      name: 'Actions',
      search: false,
      width: '150px',
      maxWidth: '150px',
    },
  ];

  const peersWithAliases = (peersConnected || []).filter((peer) => aliases && peer.address && aliases[peer.address]);
  const peersWithAliasesSorted = peersWithAliases.sort((a, b) => {
    if (getAliasByAddress(b.address).toLowerCase() > getAliasByAddress(a.address).toLowerCase()) {
      return -1;
    }
    if (getAliasByAddress(b.address).toLowerCase() < getAliasByAddress(a.address).toLowerCase()) {
      return 1;
    }
    return 0;
  });
  const peersWithoutAliases = (peersConnected || []).filter(
    (peer) => aliases && peer.address && !aliases[peer.address],
  );
  const peersWithoutAliasesSorted = peersWithoutAliases.sort((a, b) => {
    if (b.address > a.address) {
      return -1;
    }
    if (b.address < a.address) {
      return 1;
    }
    return 0;
  });

  const peersSorted = [...peersWithAliasesSorted, ...peersWithoutAliasesSorted];

  const parsedTableData = peersSorted.map((peer, index) => {
    const lastUpdate =
      peer.lastUpdate > 0
        ? new Date(peer.lastUpdate)
            .toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })
            .replace(', ', '\n')
        : 'Not seen';

    return {
      id: index + 1,
      node: <PeersInfo nodeAddress={peer.address} />,
      address: getAliasByAddress(peer.address),
      peerAddress: peer.address,
      score: <ProgressBar value={peer.score} />,
      lastUpdate: <span style={{ whiteSpace: 'break-spaces' }}>{lastUpdate}</span>,
      actions: (
        <>
          <PingModal address={peer.address} />
          <CreateAliasModal address={peer.address} />
          {nodeAddressToOutgoingChannelLink[peer.address] ? (
            <FundChannelModal address={peer.address} />
          ) : (
            <OpenChannelModal peerAddress={peer.address} />
          )}
          <OpenSessionModal destination={peer.address} />
        </>
      ),
    };
  });

  return (
    <Section
      fullHeightMin
      yellow
    >
      <SubpageTitle
        title={`PEERS (${peersConnected?.length || '-'})`}
        refreshFunction={handleRefresh}
        reloading={peersFetching}
        actions={
          <>
            <PingModal />
            <IconButton
              iconComponent={<GetAppIcon />}
              tooltipText={
                <span>
                  EXPORT
                  <br />
                  seen peers as a CSV
                </span>
              }
              disabled={!peersConnected || peersConnected.length === 0}
              onClick={handleExport}
            />
          </>
        }
      />
      <TablePro
        data={parsedTableData}
        search={true}
        header={header}
        id={'node-peers-table'}
      />
    </Section>
  );
}

export default PeersPage;
