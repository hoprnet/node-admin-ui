import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useReadOnly } from '../../store';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { fetchBlokliData } from '../../store/slices/blokli/fetchBlokliData';
import { selectBlokliUrl } from '../../store/selectors/blokli';
import { exportToFile } from '../../utils/helpers';
import { formatEther } from 'viem';

// HOPR Components
import { CardStack, TableExtended } from '../../future-hopr-lib-components/Table/columed-data';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import { Amount } from '../../components/Data';
import { SubpageTitle } from '../../components/SubpageTitle';
import Section from '../../future-hopr-lib-components/Section';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import Tooltip from '../../future-hopr-lib-components/Tooltip/tooltip-fixed-width';

// Mui

// Icons
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function TicketsPage() {
  const dispatch = useAppDispatch();
  const readOnly = useReadOnly();
  const [confirmRedeem, set_confirmRedeem] = useState(false);
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
        title="Tickets"
        actions={
          <>
            {!readOnly && (
              <IconButton
                iconComponent={<ExitToAppIcon />}
                tooltipText="Redeem all tickets"
                reloading={redeemAllTicketsFetching}
                onClick={() => set_confirmRedeem(true)}
              />
            )}
          </>
        }
      />
      <CardStack>
        <TableExtended title="Ticket statistics">
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
              <td>{ticketRedemption ? `${ticketRedemption.redemptionCount} tickets` : '-'}</td>
            </tr>
          </tbody>
        </TableExtended>

        <TableExtended title="Ticket properties">
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
      </CardStack>
      <ConfirmDialog
        open={confirmRedeem}
        title="Redeem all tickets"
        description="Redeems every winning ticket on-chain. Each redemption costs a little xDAI in gas."
        summary={[
          {
            label: 'Unredeemed value',
            value: (
              <Amount
                value={statistics?.unredeemedValue}
                unit="wxHOPR"
              />
            ),
          },
          { label: 'Winning tickets', value: statistics?.winningCount ?? '-' },
        ]}
        confirmLabel="Redeem all"
        onConfirm={() => {
          set_confirmRedeem(false);
          handleRedeemAllTickets();
        }}
        onClose={() => set_confirmRedeem(false)}
      />
    </Section>
  );
}

export default TicketsPage;
