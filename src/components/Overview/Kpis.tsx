import { ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { Amount, StatusPill, toneOf } from '../Data';
import { formatDuration } from '../../utils/format';
import { HOPR_TOKEN_USED } from '../../../config';
import { v } from '../../theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface};
  overflow: hidden;
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  min-width: 0;
  box-shadow: -1px 0 0 ${v.border}, 0 -1px 0 ${v.border};
  .label {
    font-size: 12.5px;
    color: ${v.text2};
  }
  .value {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: ${v.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
    .unit {
      margin-left: 4px;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0;
      color: ${v.text3};
    }
    .StatusPill {
      font-size: 13px;
      height: 26px;
    }
    /* big figures read better in proportional digits */
    > span {
      font-family: inherit;
      letter-spacing: inherit;
    }
  }
  .sub {
    font-size: 12px;
    color: ${v.text3};
    white-space: nowrap;
  }
  a.sub:hover {
    color: ${v.accentText};
  }
`;

const Kpi = ({ label, value, sub, to }: { label: string; value: ReactNode; sub?: ReactNode; to?: string }) => (
  <Tile>
    <span className="label">{label}</span>
    <span className="value">{value}</span>
    {sub &&
      (to ? (
        <Link
          className="sub"
          to={to}
        >
          {sub} →
        </Link>
      ) : (
        <span className="sub">{sub}</span>
      ))}
  </Tile>
);

/** The node's key numbers, at a glance. */
export default function Kpis() {
  const info = useAppSelector((store) => store.node.info.data);
  const startEpoch = useAppSelector((store) => store.node.metricsParsed.nodeStartEpoch);
  const peersConnected = useAppSelector((store) => store.node.peersConnected.data);
  const peersAnnounced = useAppSelector((store) => store.node.peersAnnounced.data);
  const channels = useAppSelector((store) => store.node.channels.data);
  const safeHopr = useAppSelector((store) => store.node.balances.data.safeHopr.formatted);
  const safeChannelsOut = useAppSelector((store) => store.blokli.channelStats.data);
  const statistics = useAppSelector((store) => store.node.statistics.data);
  const [now, set_now] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => set_now(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const open = (list?: { status: string }[]) => (list ? list.filter((c) => c.status === 'Open').length : null);

  return (
    <Grid>
      <Kpi
        label="Connectivity"
        value={
          info?.connectivityStatus ? (
            <StatusPill tone={toneOf(info.connectivityStatus)}>{info.connectivityStatus}</StatusPill>
          ) : (
            '-'
          )
        }
        sub={info?.hoprNetworkName}
      />
      <Kpi
        label="Uptime"
        value={startEpoch ? formatDuration(now / 1000 - startEpoch) : '-'}
        sub={startEpoch ? `since ${new Date(startEpoch * 1000).toLocaleDateString('en-US')}` : undefined}
      />
      <Kpi
        label="Peers"
        value={peersConnected ? peersConnected.length : '-'}
        sub={peersAnnounced ? `of ${peersAnnounced.length} announced` : undefined}
        to="/networking/peers"
      />
      <Kpi
        label="Channels"
        value={
          channels ? (
            <>
              {open(channels.outgoing)}
              <span className="unit">out</span> {open(channels.incoming)}
              <span className="unit">in</span>
            </>
          ) : (
            '-'
          )
        }
        sub="Open channels"
        to="/networking/channels"
      />
      <Kpi
        label="Safe"
        value={
          <Amount
            value={safeHopr}
            unit={HOPR_TOKEN_USED}
            decimals={0}
          />
        }
        sub={
          safeChannelsOut?.formatted ? (
            <>
              <Amount
                value={safeChannelsOut.formatted}
                decimals={0}
              />{' '}
              staked in channels
            </>
          ) : undefined
        }
        to="/safe/nodes"
      />
      <Kpi
        label="Unredeemed tickets"
        value={
          <Amount
            value={statistics?.unredeemedValue}
            unit={HOPR_TOKEN_USED}
            decimals={2}
          />
        }
        sub={statistics ? `${statistics.winningCount} winning tickets` : undefined}
        to="/node/tickets"
      />
    </Grid>
  );
}
