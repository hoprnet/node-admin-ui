import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import { useAppDispatch, useAppSelector, useReadOnly } from '../../store';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { exportToCsv } from '../../utils/helpers';
import { sendNotification } from '../../hooks/useWatcher/notifications';
import { useCloseChannel } from '../../hooks/useCloseChannel';
import { usePeerParam } from '../../hooks/usePeerParam';
import { HOPR_TOKEN_USED } from '../../../config';
import { v } from '../../theme';

// Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';
import Button from '../../future-hopr-lib-components/Button';
import TextField from '../../future-hopr-lib-components/TextField';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import { Address, Amount, Segmented, Stats, StatusPill, humanize, toneOf } from '../../components/Data';
import RowActions from '../../components/Peer/RowActions';
import PeerPanel from '../../components/Peer/PeerPanel';
import { OpenChannelModal } from '../../components/Modal/node/OpenChannelModal';
import { OpenMultipleChannelsModal } from '../../components/Modal/node/OpenMultipleChannelsModal';

// Mui
import GetAppIcon from '@mui/icons-material/GetApp';
import { InputAdornment } from '@mui/material';

type Direction = 'out' | 'in';

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${v.text2};
  .count {
    margin-right: 4px;
    color: ${v.text};
    font-weight: 500;
  }
`;

const sumBalances = (balances: (string | undefined)[]) => {
  try {
    return formatEther(balances.reduce((sum, balance) => sum + (balance ? parseEther(balance) : BigInt(0)), BigInt(0)));
  } catch (e) {
    return null;
  }
};

function ChannelsPage() {
  const dispatch = useAppDispatch();
  const readOnly = useReadOnly();
  const closeChannel = useCloseChannel();
  const [searchParams, set_searchParams] = useSearchParams();
  const direction: Direction = searchParams.get('direction') === 'in' ? 'in' : 'out';
  const { peer, open: openPeer, close: closePeer } = usePeerParam();

  const channels = useAppSelector((store) => store.node.channels.data);
  const parsed = useAppSelector((store) => store.node.channels.parsed);
  const channelsFetching = useAppSelector((store) => store.node.channels.isFetching);
  const aliases = useAppSelector((store) => store.node.aliases);
  const loginData = useAppSelector((store) => store.auth.loginData);

  const [selected, set_selected] = useState<(string | number)[]>([]);
  const [bulk, set_bulk] = useState<'close' | 'fund' | null>(null);
  const [fundAmount, set_fundAmount] = useState('');
  const [bulkPending, set_bulkPending] = useState(false);

  useEffect(() => set_selected([]), [direction]);

  const list = (direction === 'out' ? channels?.outgoing : channels?.incoming) ?? [];
  const visible = list.filter((channel) => channel.status !== 'Closed');
  const parsedDirection = direction === 'out' ? parsed.outgoing : parsed.incoming;

  const setDirection = (next: Direction) => {
    const params = new URLSearchParams(searchParams);
    params.set('direction', next);
    params.delete('peer');
    set_searchParams(params);
  };

  const handleExport = () =>
    exportToCsv(
      list.map((channel) => ({
        channelId: channel.id,
        peerAddress: channel.peerAddress,
        alias: aliases?.[channel.peerAddress] ?? '',
        status: channel.status,
        dedicatedFunds: channel.balance,
      })),
      `${direction === 'out' ? 'outgoing' : 'incoming'}-channels.csv`,
    );

  const rows = visible.map((channel, index) => {
    const alias = aliases?.[channel.peerAddress];
    const isClosing = parsedDirection[channel.id]?.isClosing;
    return {
      id: channel.id,
      index: index + 1,
      node: (
        <Address
          address={channel.peerAddress}
          alias={alias ?? null}
        />
      ),
      // plain values for search and sorting
      peer: `${alias ?? ''} ${channel.peerAddress}`,
      peerAddress: channel.peerAddress,
      statusText: channel.status,
      status: (
        <StatusPill tone={isClosing ? 'warning' : toneOf(channel.status)}>
          {isClosing ? 'Closing…' : humanize(channel.status)}
        </StatusPill>
      ),
      balance: channel.balance,
      funds: (
        <Amount
          value={channel.balance}
          unit={HOPR_TOKEN_USED}
        />
      ),
      actions: (
        <RowActions
          address={channel.peerAddress}
          onDetails={() => openPeer(channel.peerAddress)}
        />
      ),
    };
  });

  const header = [
    { key: 'node', name: 'Peer', search: false, sortKey: 'peer' },
    { key: 'peer', name: 'Peer', search: true, hidden: true },
    { key: 'status', name: 'Status', sortKey: 'statusText', width: '160px' },
    { key: 'statusText', name: 'Status', search: true, hidden: true },
    { key: 'funds', name: 'Funds', sortKey: 'balance', align: 'right' as const, width: '200px' },
    { key: 'actions', name: '', width: '56px' },
  ];

  const count = (status: string) => visible.filter((channel) => channel.status === status).length;
  const total = sumBalances(visible.map((channel) => channel.balance));
  const selectedChannels = visible.filter((channel) => selected.includes(channel.id));
  const selectedTotal = sumBalances(selectedChannels.map((channel) => channel.balance));

  const runBulk = async () => {
    set_bulkPending(true);
    if (bulk === 'close') {
      await Promise.allSettled(
        selectedChannels.map((channel) =>
          closeChannel(direction === 'out' ? 'outgoing' : 'incoming', channel.peerAddress),
        ),
      );
    }
    if (bulk === 'fund' && loginData.apiEndpoint) {
      const wei = parseEther(fundAmount).toString();
      const results = await Promise.allSettled(
        selectedChannels.map((channel) =>
          dispatch(
            actionsAsync.fundChannelThunk({
              apiEndpoint: loginData.apiEndpoint!,
              apiToken: loginData.apiToken ?? '',
              amount: `${wei} wei wxHOPR`,
              address: channel.peerAddress,
              timeout: 120_000,
            }),
          ).unwrap(),
        ),
      );
      const failed = results.filter((result) => result.status === 'rejected').length;
      const message = failed
        ? `Funding failed for ${failed} of ${results.length} channels`
        : `${results.length} channels funded with ${fundAmount} ${HOPR_TOKEN_USED} each`;
      sendNotification({
        notificationPayload: { source: 'node', name: message, url: null, timeout: null },
        toastPayload: { message },
        dispatch,
      });
      dispatch(
        actionsAsync.getChannelsThunk({ apiEndpoint: loginData.apiEndpoint, apiToken: loginData.apiToken ?? '' }),
      );
    }
    set_bulkPending(false);
    set_bulk(null);
    set_fundAmount('');
    set_selected([]);
  };

  const fundAmountValid = (() => {
    try {
      return !!fundAmount && parseEther(fundAmount) > BigInt(0);
    } catch (e) {
      return false;
    }
  })();

  return (
    <Section
      className="Section--channels"
      id="Section--channels"
      fullHeightMin
    >
      <SubpageTitle
        title="Channels"
        count={channels ? (channels.outgoing.length ?? 0) + (channels.incoming.length ?? 0) : null}
        actions={
          <>
            <OpenChannelModal />
            <OpenMultipleChannelsModal />
            <IconButton
              iconComponent={<GetAppIcon />}
              tooltipText={`Export ${direction === 'out' ? 'outgoing' : 'incoming'} channels as CSV`}
              disabled={list.length === 0}
              onClick={handleExport}
            />
          </>
        }
      />
      <Segmented
        value={direction}
        onChange={setDirection}
        options={[
          { value: 'out', label: 'Outgoing', count: channels ? channels.outgoing.length : null },
          { value: 'in', label: 'Incoming', count: channels ? channels.incoming.length : null },
        ]}
      />
      <Stats
        items={[
          {
            label: direction === 'out' ? 'Staked in channels' : 'Staked by peers',
            value: (
              <Amount
                value={total}
                unit={HOPR_TOKEN_USED}
              />
            ),
          },
          { label: 'Open', value: count('Open') },
          { label: 'Pending to close', value: count('PendingToClose') },
        ]}
      />
      <TablePro
        data={rows}
        id={`node-channels-${direction}-table`}
        header={header}
        search
        loading={rows.length === 0 && channelsFetching}
        emptyText={direction === 'out' ? 'No outgoing channels' : 'No incoming channels'}
        orderByDefault="node"
        onRowClick={(row: { peerAddress: string }) => openPeer(row.peerAddress)}
        activeRowId={peer ? visible.find((channel) => channel.peerAddress === peer)?.id ?? null : null}
        selectable={!readOnly}
        selected={selected}
        onSelectionChange={set_selected}
        toolbar={
          selected.length > 0 && (
            <BulkBar>
              <span className="count">{selected.length} selected</span>
              {direction === 'out' && (
                <Button
                  outlined
                  size="small"
                  onClick={() => set_bulk('fund')}
                >
                  Fund
                </Button>
              )}
              <Button
                outlined
                size="small"
                onClick={() => set_bulk('close')}
              >
                Close
              </Button>
            </BulkBar>
          )
        }
      />
      <ConfirmDialog
        open={bulk === 'close'}
        title={`Close ${selected.length} ${direction === 'out' ? 'outgoing' : 'incoming'} channels`}
        description={
          direction === 'out'
            ? 'Starts closing every selected channel. Pending ones are finalized. Funds return to your safe once closed.'
            : 'Closes every selected incoming channel. Unredeemed tickets of these channels are lost.'
        }
        summary={[
          { label: 'Channels', value: selected.length },
          {
            label: 'Funds',
            value: (
              <Amount
                value={selectedTotal}
                unit={HOPR_TOKEN_USED}
              />
            ),
          },
        ]}
        confirmLabel={`Close ${selected.length} channels`}
        danger
        pending={bulkPending}
        onConfirm={runBulk}
        onClose={() => set_bulk(null)}
      />
      <ConfirmDialog
        open={bulk === 'fund'}
        title={`Fund ${selected.length} channels`}
        description={
          <TextField
            label="Amount per channel"
            type="number"
            value={fundAmount}
            onChange={(event) => set_fundAmount(event.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">{HOPR_TOKEN_USED}</InputAdornment> }}
            sx={{ mt: 1 }}
          />
        }
        summary={[
          { label: 'Channels', value: selected.length },
          {
            label: 'Total',
            value: fundAmountValid ? (
              <Amount
                value={Number(fundAmount) * selected.length}
                unit={HOPR_TOKEN_USED}
              />
            ) : (
              '-'
            ),
          },
        ]}
        confirmLabel="Fund channels"
        pending={bulkPending}
        onConfirm={() => fundAmountValid && runBulk()}
        onClose={() => set_bulk(null)}
      />
      <PeerPanel
        address={peer}
        onClose={closePeer}
      />
    </Section>
  );
}

export default ChannelsPage;
