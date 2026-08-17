import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Link } from 'react-router-dom';
import { copyStringToClipboard } from '../../../utils/functions';
import { formatEther } from 'viem';

// Mui
import { Paper } from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

// HOPR Components
import Section from '../../../future-hopr-lib-components/Section';
import { actionsAsync as nodeActionsAsync } from '../../../store/slices/node/actionsAsync';
import { fetchBlokliData } from '../../../store/slices/blokli/fetchBlokliData';
import { selectBlokliUrl } from '../../../store/selectors/blokli';
import { TableExtended } from '../../../future-hopr-lib-components/Table/columed-data';
import { SubpageTitle } from '../../../components/SubpageTitle';
import Tooltip from '../../../future-hopr-lib-components/Tooltip/tooltip-fixed-width';
import WithdrawModal from '../../../components/Modal/node/WithdrawModal';
import SmallActionButton from '../../../future-hopr-lib-components/Button/SmallActionButton';
import { ColorStatus } from '../../../components/InfoBar/details';
import ProgressBar from '../../../future-hopr-lib-components/Progressbar';
import IconButton from '../../../future-hopr-lib-components/Button/IconButton';

//Icons
import CopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import DataObjectIcon from '@mui/icons-material/DataObject';

//Info Components
import NodeUptime from './node-uptime';
import Packets from './packets';

const TdActionIcons = styled.td`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TD = styled.td``;

function InfoPage() {
  const dispatch = useAppDispatch();
  const { apiEndpoint, apiToken } = useAppSelector((store) => store.auth.loginData);
  const balances = useAppSelector((store) => store.node.balances.data);
  const balancesFetching = useAppSelector((store) => store.node.balances.isFetching);
  const addresses = useAppSelector((store) => store.node.addresses.data);
  const addressesFetching = useAppSelector((store) => store.node.addresses.isFetching);
  const channels = useAppSelector((store) => store.node.channels.data);
  const channelsFetching = useAppSelector((store) => store.node.channels.isFetching);
  const version = useAppSelector((store) => store.node.version.data);
  const versionFetching = useAppSelector((store) => store.node.version.isFetching);
  const info = useAppSelector((store) => store.node.info.data);
  const infoFetching = useAppSelector((store) => store.node.info.isFetching);
  const peersAnnounced = useAppSelector((store) => store.node.peersAnnounced.data);
  const peersAnnouncedFetching = useAppSelector((store) => store.node.peersAnnounced.isFetching);
  const peersConnected = useAppSelector((store) => store.node.peersConnected.data);
  const peersConnectedFetching = useAppSelector((store) => store.node.peersConnected.isFetching);
  const aliases = useAppSelector((store) => store.node.aliases);
  const nodeStartedEpoch = useAppSelector((store) => store.node.metricsParsed.nodeStartEpoch);
  const nodeStartedTime =
    nodeStartedEpoch && typeof nodeStartedEpoch === 'number'
      ? new Date(nodeStartedEpoch * 1000).toJSON().replace('T', ' ').replace('Z', ' UTC')
      : '-';
  const nodeSync = useAppSelector((store) => store.node.metricsParsed.nodeSync);
  const ticketPrice = useAppSelector((store) => store.node.ticketPrice.data);
  const minimumNetworkProbability = useAppSelector((store) => store.node.probability.data);
  // blokli: safe wide channel stake and this node's on chain ticket redemptions
  const blokliUrl = useAppSelector(selectBlokliUrl);
  const safeChannelsOut = useAppSelector((store) => store.blokli.channelStats.data);
  const channelStatsFetching = useAppSelector((store) => store.blokli.channelStats.isFetching);
  const ticketRedemption = useAppSelector((store) => store.blokli.ticketRedemption.data);
  const ticketRedemptionFetching = useAppSelector((store) => store.blokli.ticketRedemption.isFetching);
  const [showWholeProvider, set_showWholeProvider] = useState(false);
  const [providerShort, set_providerShort] = useState('');
  const [providerContainsSecret, set_providerContainsSecret] = useState(true);
  const provider = info?.providerUrl;

  useEffect(() => {
    fetchInfoData();
  }, [apiEndpoint, apiToken]);

  useEffect(() => {
    try {
      if (!provider) {
        set_providerShort('');
        return;
      }
      const providerObject = new URL(provider);
      const providerContainsSecret = providerObject.pathname !== '/' || providerObject.search !== '';
      set_providerContainsSecret(providerContainsSecret);
      const providerShort = providerContainsSecret ? providerObject.origin + '/************' : provider;
      set_providerShort(providerShort || '');
    } catch (e) {
      console.error('Error parsing provider URL', e);
      set_providerShort('***Invalid URL***');
    }
  }, [provider]);

  useEffect(() => {
    const watchSync = setInterval(() => {
      if (!apiEndpoint || (nodeSync && nodeSync === 1)) return;
      return dispatch(
        nodeActionsAsync.getPrometheusMetricsThunk({
          apiEndpoint,
          apiToken: apiToken ? apiToken : '',
        }),
      );
    }, 5_000);

    return () => {
      clearInterval(watchSync);
    };
  }, [nodeSync, apiEndpoint, apiToken]);

  const fetchInfoData = () => {
    if (!apiEndpoint) return;

    dispatch(
      nodeActionsAsync.getBalancesThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getChannelsThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getAddressesThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getVersionThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getInfoThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getConnectedPeersThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getAnnouncedPeersThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(
      nodeActionsAsync.getTicketStatisticsThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    fetchBlokliData({
      blokliUrl,
      nodeAddress: addresses?.native,
      safeAddress: info?.hoprNodeSafe,
      dispatch,
    });
  };

  // This will allow us to improve readability on the reloading prop for SubpageTitle
  const isFetchingAnyData = [
    balancesFetching,
    addressesFetching,
    channelsFetching,
    versionFetching,
    infoFetching,
    peersConnectedFetching,
    peersAnnouncedFetching,
    channelStatsFetching,
    ticketRedemptionFetching,
  ].includes(true);

  const noCopyPaste = !(
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // check if user is logged in
  if (!apiEndpoint) {
    return (
      <Section
        className="Section--selectNode"
        id="Section--selectNode"
        yellow
        fullHeightMin
      >
        Login to node
      </Section>
    );
  }

  return (
    <Section
      className="Section--selectNode"
      id="Section--selectNode"
      fullHeightMin
      yellow
    >
      <SubpageTitle
        title="INFO"
        refreshFunction={fetchInfoData}
        reloading={isFetchingAnyData}
        actions={
          <>
            <WithdrawModal />
            <IconButton
              iconComponent={<DataObjectIcon />}
              tooltipText={
                <span>
                  OPEN
                  <br />
                  Swagger UI
                </span>
              }
              onClick={() => {
                const externalUrl = apiEndpoint + '/swagger-ui/index.html#/';
                const w = window.open(externalUrl, '_blank');
                w && w.focus();
              }}
            />
            <IconButton
              iconComponent={
                <img
                  style={{ maxWidth: '20px' }}
                  src="/assets/scalar-removebg-preview.png"
                />
              }
              tooltipText={
                <span>
                  OPEN
                  <br />
                  Scalar UI
                </span>
              }
              onClick={() => {
                const externalUrl = apiEndpoint + '/scalar';
                const w = window.open(externalUrl, '_blank');
                w && w.focus();
              }}
            />
          </>
        }
      />
      <Paper
        style={{
          padding: '24px',
          width: 'calc( 100% - 48px )',
        }}
      >
        <TableExtended
          title="Network"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title={
                    <ul
                      style={{
                        margin: 0,
                        padding: '0 0 0 16px',
                      }}
                    >
                      <span style={{ margin: '0 0 0 -16px' }}>Possible statuses:</span>
                      <li>Unknown: Node has just been started recently</li>
                      <li>Red: No connection</li>
                      <li>Orange: low-quality connection</li>
                      <li>Yellow/Green: High-quality node</li>
                    </ul>
                  }
                >
                  <span>Connectivity status</span>
                </Tooltip>
              </th>
              <td>
                <ColorStatus className={`status-${info?.connectivityStatus}`}>{info?.connectivityStatus}</ColorStatus>
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The HOPR network your node is running on"
                  notWide
                >
                  <span>Network name</span>
                </Tooltip>
              </th>
              <td>{info?.hoprNetworkName ? info.hoprNetworkName : '-'}</td>
            </tr>
            {/* <tr>
              <th>
                <Tooltip
                  title="The sync process of your node with the blockchain"
                  notWide
                >
                  <span>Sync process</span>
                </Tooltip>
              </th>
              <td>{nodeSync && typeof nodeSync === 'number' ? <ProgressBar value={nodeSync} /> : '-'}</td>
            </tr> */}
            <tr>
              <th style={providerContainsSecret ? { padding: '3px 8px' } : {}}>
                <div style={{ display: 'flex' }}>
                  <Tooltip
                    title="The blokli provider address your node uses sync"
                    notWide
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>Provider address</span>
                  </Tooltip>
                  {providerContainsSecret && (
                    <>
                      {showWholeProvider ? (
                        <IconButton
                          iconComponent={<Visibility />}
                          tooltipText={
                            <span>
                              HIDE
                              <br />
                              full URL
                            </span>
                          }
                          onClick={() => {
                            set_showWholeProvider(false);
                          }}
                        />
                      ) : (
                        <IconButton
                          iconComponent={<VisibilityOff />}
                          tooltipText={
                            <span>
                              SHOW
                              <br />
                              full URL
                            </span>
                          }
                          onClick={() => {
                            set_showWholeProvider(true);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </th>
              <td>{showWholeProvider ? provider : providerShort}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The address your node announces to make itself reachable for other nodes"
                  notWide
                >
                  <span>Announced address</span>
                </Tooltip>
              </th>
              <td>{info?.announcedAddress}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The address your node uses to listen for incoming connections"
                  notWide
                >
                  <span>Listening address</span>
                </Tooltip>
              </th>
              <td>{info?.listeningAddress}</td>
            </tr>
            {/* <tr>
              <th>
                <Tooltip
                  title="The blockchain network your node is using for on-chain transactions"
                  notWide
                >
                  <span>Blockchain network</span>
                </Tooltip>
              </th>
              <td>{info?.chain}</td>
            </tr> */}
            {/* <tr>
              <th>
                <Tooltip
                  title="Last block that the node got from the RPC"
                  notWide
                >
                  <span>Current block</span>
                </Tooltip>
              </th>
              <td>{blockNumberFromInfo ? blockNumberFromInfo : '-'}</td>
            </tr> */}
            {/* <tr>
              <th>
                <Tooltip
                  title="Last indexed block from the chain which contains HOPR data"
                  notWide
                >
                  <span>
                    Last indexed
                    <br />
                    log at block
                  </span>
                </Tooltip>
              </th>
              <td>{indexerLastLogBlock ? indexerLastLogBlock : '-'}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The latest hash of the node database"
                  notWide
                >
                  <span>
                    Last indexed
                    <br />
                    log checksum
                  </span>
                </Tooltip>
              </th>
              <td>{indexerLastLogChecksum ? indexerLastLogChecksum : '-'}</td>
            </tr> */}
          </tbody>
        </TableExtended>

        <TableExtended
          title="Balances"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The amount of xDAI stored on your Node"
                  notWide
                >
                  <span>xDAI: Node</span>
                </Tooltip>
              </th>
              <td>{balances.native?.formatted} xDAI</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The amount of xDAI stored on your Safe"
                  notWide
                >
                  <span>xDAI: Safe</span>
                </Tooltip>
              </th>
              <td>{balances.safeNative?.formatted} xDAI</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The amount of wxHOPR stored on your Safe"
                  notWide
                >
                  <span>wxHOPR: Safe</span>
                </Tooltip>
              </th>
              <td>{balances.safeHopr?.formatted} wxHOPR</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The amount of wxHOPR tokens staked in the open outgoing channels of every Node registered to your Safe. Read from blokli."
                  notWide
                >
                  <span>wxHOPR: Node channels OUT</span>
                </Tooltip>
              </th>
              <td>
                {balances.channels?.formatted ? `${balances.channels.formatted} wxHOPR` : '-'}
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The amount of wxHOPR tokens staked in the open outgoing channels of every Node registered to your Safe. Read from blokli."
                  notWide
                >
                  <span>wxHOPR: Safe channels OUT</span>
                </Tooltip>
              </th>
              <td>
                {safeChannelsOut ? `${safeChannelsOut.formatted} wxHOPR (${safeChannelsOut.count} channels)` : '-'}
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The total amount of wxHOPR staked in your Safe and in the outgoing Channels of every Node registered to it. The channels part is read from blokli."
                  notWide
                >
                  <span>wxHOPR: Total Staked</span>
                </Tooltip>
              </th>
              <td>
                {safeChannelsOut?.value && balances.safeHopr?.value
                  ? `${formatEther(BigInt(safeChannelsOut.value) + BigInt(balances.safeHopr.value))} wxHOPR`
                  : '-'}
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The amount of wxHOPR set as allowance for Node to use"
                  notWide
                >
                  <span>wxHOPR: Allowance</span>
                </Tooltip>
              </th>
              <td>{balances.safeHoprAllowance?.formatted} wxHOPR</td>
            </tr>
          </tbody>
        </TableExtended>

        <TableExtended
          title="Ticket properties"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The current price of a single ticket"
                  notWide
                >
                  <span>Current ticket price</span>
                </Tooltip>
              </th>
              <td>{ticketPrice ? ticketPrice : '-'} wxHOPR</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  //  title={`Minimum allowed winning probability of the ticket as defined in the ${info?.network} network`}
                  title={`Minimum allowed winning probability of the ticket as defined in the network`}
                  notWide
                >
                  <span>Minimum ticket winning probability</span>
                </Tooltip>
              </th>
              <td>{minimumNetworkProbability ? minimumNetworkProbability.toFixed(9) : '-'}</td>
            </tr>
          </tbody>
        </TableExtended>

        <TableExtended
          title="Addresses"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="Your node's Ethereum address"
                  notWide
                >
                  <span>Node Address</span>
                </Tooltip>
              </th>
              <TdActionIcons>
                {addresses?.native}
                {addresses?.native && (
                  <>
                    <SmallActionButton
                      onClick={() => navigator.clipboard.writeText(addresses?.native as string)}
                      disabled={noCopyPaste}
                      tooltip={noCopyPaste ? 'Clipboard not supported on HTTP' : 'Copy'}
                    >
                      <CopyIcon />
                    </SmallActionButton>
                    <SmallActionButton tooltip={'Open in gnosisscan.io'}>
                      <Link
                        to={`https://gnosisscan.io/address/${addresses?.native}`}
                        target="_blank"
                      >
                        <LaunchIcon />
                      </Link>
                    </SmallActionButton>
                  </>
                )}
              </TdActionIcons>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="Your safe's Ethereum address"
                  notWide
                >
                  <span>Safe Address</span>
                </Tooltip>
              </th>
              <TdActionIcons>
                {info?.hoprNodeSafe}
                {info?.hoprNodeSafe && (
                  <>
                    <SmallActionButton
                      onClick={() => navigator.clipboard.writeText(info.hoprNodeSafe as string)}
                      disabled={noCopyPaste}
                      tooltip={noCopyPaste ? 'Clipboard not supported on HTTP' : 'Copy'}
                    >
                      <CopyIcon />
                    </SmallActionButton>
                    <SmallActionButton tooltip={'Open in gnosisscan.io'}>
                      <Link
                        to={`https://gnosisscan.io/address/${info.hoprNodeSafe}`}
                        target="_blank"
                      >
                        <LaunchIcon />
                      </Link>
                    </SmallActionButton>
                  </>
                )}
              </TdActionIcons>
            </tr>
            {/* <tr>
              <th>
                <Tooltip
                  title="The contract address of the HOPR token"
                  notWide
                >
                  <span>Hopr Token Address</span>
                </Tooltip>
              </th>
              <TdActionIcons>
                {info?.hoprToken}
                {info?.hoprToken && (
                  <>
                    <SmallActionButton
                      onClick={() => navigator.clipboard.writeText(info?.hoprToken as string)}
                      disabled={noCopyPaste}
                      tooltip={noCopyPaste ? 'Clipboard not supported on HTTP' : 'Copy'}
                    >
                      <CopyIcon />
                    </SmallActionButton>
                    <SmallActionButton tooltip={'Open in gnosisscan.io'}>
                      <Link
                        to={`https://gnosisscan.io/address/${info?.hoprToken}`}
                        target="_blank"
                      >
                        <LaunchIcon />
                      </Link>
                    </SmallActionButton>
                  </>
                )}
              </TdActionIcons>
            </tr> */}
            {/* <tr>
              <th>
                <Tooltip
                  title="The contract address of the Hopr management module"
                  notWide
                >
                  <span>Hopr management module address</span>
                </Tooltip>
              </th>
              <TdActionIcons>
                {info?.hoprManagementModule}
                {info?.hoprManagementModule && (
                  <>
                    <SmallActionButton
                      onClick={() => navigator.clipboard.writeText(info.hoprManagementModule as string)}
                      disabled={noCopyPaste}
                      tooltip={noCopyPaste ? 'Clipboard not supported on HTTP' : 'Copy'}
                    >
                      <CopyIcon />
                    </SmallActionButton>
                    <SmallActionButton tooltip={'Open on gnosisscan.io'}>
                      <Link
                        to={`https://gnosisscan.io/address/${info.hoprManagementModule}`}
                        target="_blank"
                      >
                        <LaunchIcon />
                      </Link>
                    </SmallActionButton>
                  </>
                )}
              </TdActionIcons>
            </tr> */}
            {/* <tr>
              <th>
                <Tooltip
                  title="The contract address of the hoprChannels smart contract"
                  notWide
                >
                  <span>Hopr Channels Address</span>
                </Tooltip>
              </th>
              <TdActionIcons>
                {info?.hoprChannels}
                {info?.hoprChannels && (
                  <>
                    <SmallActionButton
                      onClick={() => navigator.clipboard.writeText(info?.hoprChannels as string)}
                      disabled={noCopyPaste}
                      tooltip={noCopyPaste ? 'Clipboard not supported on HTTP' : 'Copy'}
                    >
                      <CopyIcon />
                    </SmallActionButton>
                    <SmallActionButton tooltip={'Open in gnosisscan.io'}>
                      <Link
                        to={`https://gnosisscan.io/address/${info?.hoprChannels}`}
                        target="_blank"
                      >
                        <LaunchIcon />
                      </Link>
                    </SmallActionButton>
                  </>
                )}
              </TdActionIcons>
            </tr> */}
          </tbody>
        </TableExtended>

        <TableExtended
          title="Node"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The version of HOPR your node is running"
                  notWide
                >
                  <span>Version</span>
                </Tooltip>
              </th>
              <td>{version?.replaceAll('"', '')}</td>
            </tr>
            <tr key="node-startdate">
              <th>
                <Tooltip
                  title="Date when you node was started"
                  notWide
                >
                  <span>Start date</span>
                </Tooltip>
              </th>
              <td>{nodeStartedTime}</td>
            </tr>
            <NodeUptime />
          </tbody>
        </TableExtended>

        <Packets />

        <TableExtended
          title="Channels"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The number of incoming channels connected to your node"
                  notWide
                >
                  <span>Incoming</span>
                </Tooltip>
              </th>
              <td>{channels?.incoming.length}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The number of outgoing channels connected to your node"
                  notWide
                >
                  <span>Outgoing</span>
                </Tooltip>
              </th>
              <td>{channels?.outgoing.length}</td>
            </tr>
          </tbody>
        </TableExtended>

        <TableExtended
          title="Nodes on the network"
          style={{ marginBottom: '42px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The number of announced nodes on the network visible to your node"
                  notWide
                >
                  <span>Announced</span>
                </Tooltip>
              </th>
              <td>{peersAnnounced?.length}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The number of nodes on the network your node can reach"
                  notWide
                >
                  <span>Connected</span>
                </Tooltip>
              </th>
              <td>{peersConnected?.length}</td>
            </tr>
          </tbody>
        </TableExtended>
      </Paper>
    </Section>
  );
}

export default InfoPage;
