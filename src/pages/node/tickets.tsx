import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { fetchBlokliData } from '../../store/slices/blokli/fetchBlokliData';
import { selectBlokliUrl } from '../../store/selectors/blokli';
import { exportToFile } from '../../utils/helpers';
import { formatEther } from 'viem';

// HOPR Components
import { TableExtended } from '../../future-hopr-lib-components/Table/columed-data';
import { SubpageTitle } from '../../components/SubpageTitle';
import Section from '../../future-hopr-lib-components/Section';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import Tooltip from '../../future-hopr-lib-components/Tooltip/tooltip-fixed-width';

// Mui
import { Paper } from '@mui/material';

// Icons
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function TicketsPage() {
  const dispatch = useAppDispatch();
  const statistics = useAppSelector((store) => store.node.statistics.data);
  const statisticsFetching = useAppSelector((store) => store.node.statistics.isFetching);
  const redeemAllTicketsFetching = useAppSelector((store) => store.node.redeemAllTickets.isFetching);
  const resettingTicketStatistics = useAppSelector((store) => store.node.resetTicketStatistics.isFetching);
  const redeemAllTicketsErrors = useAppSelector((store) => store.node.redeemAllTickets.error);
  const loginData = useAppSelector((store) => store.auth.loginData);
  const info = useAppSelector((store) => store.node.info.data);
  const nodeAddress = useAppSelector((store) => store.node.addresses.data.native);
  const blokliUrl = useAppSelector(selectBlokliUrl);
  const ticketRedemption = useAppSelector((store) => store.blokli.ticketRedemption.data);
  const ticketPrice = useAppSelector((store) => store.node.ticketPrice.data);
  const minimumNetworkProbability = useAppSelector((store) => store.node.probability.data);
  const [resettingStats, set_resettingStats] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, [loginData, dispatch]);

  useEffect(() => {
    if (resettingTicketStatistics) {
      set_resettingStats(true);
    } else {
      setTimeout(() => {
        set_resettingStats(false);
      }, 2000);
    }
  }, [resettingTicketStatistics]);

  const handleRefresh = () => {
    if (loginData.apiEndpoint) {
      dispatch(
        actionsAsync.getTicketStatisticsThunk({
          apiEndpoint: loginData.apiEndpoint,
          apiToken: loginData.apiToken ? loginData.apiToken : '',
        }),
      );
    }
    fetchBlokliData({
      blokliUrl,
      nodeAddress,
      safeAddress: info?.hoprNodeSafe,
      dispatch,
    });
  };

  const handleRedeemAllTickets = () => {
    dispatch(
      actionsAsync.redeemAllTicketsThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ? loginData.apiToken : '',
      }),
    )
      .unwrap()
      .then(() => {
        handleRefresh();
      });
  };

  // const handleResetTicketsStatistics = () => {
  //   dispatch(
  //     actionsAsync.resetTicketStatisticsThunk({
  //       apiEndpoint: loginData.apiEndpoint!,
  //       apiToken: loginData.apiToken ? loginData.apiToken : '',
  //     }),
  //   )
  //     .unwrap()
  //     .then(() => {
  //       handleRefresh();
  //     });
  // };

  return (
    <Section
      className="Section--tickets"
      id="Section--tickets"
      fullHeightMin
      yellow
    >
      <SubpageTitle
        title="TICKETS"
        refreshFunction={handleRefresh}
        reloading={statisticsFetching}
        actions={
          <>
            <IconButton
              iconComponent={<ExitToAppIcon />}
              tooltipText={
                <span>
                  REDEEM
                  <br />
                  all tickets
                </span>
              }
              reloading={redeemAllTicketsFetching}
              onClick={handleRedeemAllTickets}
            />
            <IconButton
              iconComponent={<RotateLeftIcon />}
              tooltipText={
                <span>
                  {'<REMOVED in V4> '}RESET
                  <br />
                  ticket statistics
                </span>
              }
              reloading={resettingStats}
              disabled
              //  onClick={handleResetTicketsStatistics}
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
          title="Ticket statistics"
          style={{ marginBottom: '32px' }}
        >
          <tbody>
            <tr>
              <th>
                <Tooltip
                  title="The value of all your unredeemed tickets in HOPR tokens. Value is counted from last DB reset."
                  notWide
                >
                  <span>Unredeemed value</span>
                </Tooltip>
              </th>
              <td>{statistics?.unredeemedValue ? statistics?.unredeemedValue : '-'} wxHOPR</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The number of tickets lost due to channels closing without ticket redemption. Value is counted from last DB reset."
                  notWide
                >
                  <span>Neglected value</span>
                </Tooltip>
              </th>
              <td>{statistics?.neglectedValue ? statistics?.neglectedValue : '-'} wxHOPR</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The value of your rejected tickets in HOPR tokens. Value is counted from last DB reset."
                  notWide
                >
                  <span>Rejected value</span>
                </Tooltip>
              </th>
              <td>{statistics?.rejectedValue ? statistics?.rejectedValue : '-'} wxHOPR</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The total value of the tickets this node has redeemed on chain, all time. Read from blokli, so unlike the values above it survives a DB reset."
                  notWide
                >
                  <span>Redeemed value</span>
                </Tooltip>
              </th>
              <td>{ticketRedemption ? `${ticketRedemption.redeemed.formatted} wxHOPR` : '-'}</td>
            </tr>
            <tr>
              <th>
                <Tooltip
                  title="The number of on chain ticket redemptions made by this node, all time. Read from blokli."
                  notWide
                >
                  <span>Redemptions</span>
                </Tooltip>
              </th>
              <td>{ticketRedemption ? ticketRedemption.redemptionCount : '-'}</td>
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
                  title={`Minimum allowed winning probability of the ticket as defined in the current network`}
                  notWide
                >
                  <span>Minimum ticket winning probability</span>
                </Tooltip>
              </th>
              <td>{minimumNetworkProbability ? minimumNetworkProbability.toFixed(9) : '-'}</td>
            </tr>
          </tbody>
        </TableExtended>
      </Paper>
    </Section>
  );
}

export default TicketsPage;
