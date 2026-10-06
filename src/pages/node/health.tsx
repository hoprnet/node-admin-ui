import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '../../store';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { toGauge, toRate, MetricSample } from '../../utils/prometheus';
import { formatCompact } from '../../utils/format';
import { v } from '../../theme';

import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import MetricCard from '../../components/Charts/MetricCard';
import { StatusPill } from '../../components/Data';

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: ${v.text};
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
`;

const Note = styled.p`
  margin: -8px 0 0;
  font-size: 13px;
  color: ${v.text2};
`;

// metrics are polled faster while this page is open
const FAST_POLL_MS = 15_000;

const latest = (samples: MetricSample[], series: string) => {
  for (let i = samples.length - 1; i >= 0; i--) {
    const value = samples[i].values[series];
    if (value !== undefined) return value;
  }
  return null;
};

const NAT = ['Unknown', 'Public', 'Private'];

const perSecond = (n: number) => (n < 10 ? n.toFixed(2) : formatCompact(n));

function HealthPage() {
  const dispatch = useAppDispatch();
  const { apiEndpoint, apiToken } = useAppSelector((store) => store.auth.loginData);
  const paused = useAppSelector((store) => store.ui.sync.paused);
  const samples = useAppSelector((store) => store.ui.metricsHistory);

  useEffect(() => {
    if (!apiEndpoint || paused) return;
    const poll = () => dispatch(actionsAsync.getPrometheusMetricsThunk({ apiEndpoint, apiToken: apiToken ?? '' }));
    poll();
    const interval = setInterval(poll, FAST_POLL_MS);
    return () => clearInterval(interval);
  }, [apiEndpoint, apiToken, paused]);

  const nat = latest(samples, 'hopr_transport_p2p_nat_status');
  const winning = latest(samples, 'hopr_tickets_count{type="winning"}');
  const losing = latest(samples, 'hopr_tickets_count{type="losing"}');
  const span =
    samples.length > 1 ? Math.round((samples[samples.length - 1].timestamp - samples[0].timestamp) / 60000) : 0;

  return (
    <Section
      className="Section--health"
      id="Section--health"
      fullHeightMin
    >
      <SubpageTitle title="Health" />
      <Note>
        Recorded in this browser while the dashboard is open
        {span > 0 ? `, last ${span} min` : ''}. Rates are per second.
      </Note>

      <Group>
        <h3>Traffic</h3>
        <div className="grid">
          <MetricCard
            label="Packets relayed"
            hint="Packets forwarded for other nodes"
            data={toRate(samples, 'hopr_packets_count{type="forwarded"}')}
            unit=" /s"
            format={perSecond}
          />
          <MetricCard
            label="Packets sent"
            data={toRate(samples, 'hopr_packets_count{type="sent"}')}
            unit=" /s"
            format={perSecond}
          />
          <MetricCard
            label="Packets received"
            data={toRate(samples, 'hopr_packets_count{type="received"}')}
            unit=" /s"
            format={perSecond}
          />
          <MetricCard
            label="Packets rejected"
            hint="Undecodable packets and processing errors"
            data={toRate(samples, 'hopr_packet_rejected_count')}
            unit=" /s"
            format={perSecond}
          />
        </div>
      </Group>

      <Group>
        <h3>Mixing</h3>
        <div className="grid">
          <MetricCard
            label="Mixer queue"
            hint="Packets waiting in the mixer"
            data={toGauge(samples, 'hopr_mixer_queue_size')}
          />
          <MetricCard
            label="Average mixing delay"
            data={toGauge(samples, 'hopr_mixer_average_packet_delay')}
            unit=" ms"
            format={(n) => n.toFixed(1)}
          />
        </div>
      </Group>

      <Group>
        <h3>Connectivity</h3>
        <div className="grid">
          <MetricCard
            label="P2P connections"
            data={toGauge(samples, 'hopr_transport_p2p_active_connection_count')}
          />
          <MetricCard
            label="Known peers"
            data={toGauge(samples, 'hopr_peer_count')}
          />
          <MetricCard
            label="NAT status"
            hint="As detected by libp2p autonat. A private node can only be reached through relays."
            value={
              <StatusPill tone={nat === 1 ? 'success' : nat === 2 ? 'warning' : 'neutral'}>
                {nat === null ? '-' : NAT[nat] ?? `Status ${nat}`}
              </StatusPill>
            }
          />
        </div>
      </Group>

      <Group>
        <h3>Economics</h3>
        <div className="grid">
          <MetricCard
            label="Winning tickets"
            hint="Tickets received by this node that won"
            data={toGauge(samples, 'hopr_tickets_count{type="winning"}')}
            footer={
              winning !== null && losing !== null && winning + losing > 0
                ? `Win rate ${((winning / (winning + losing)) * 100).toPrecision(2)}% of ${formatCompact(
                    winning + losing,
                  )} tickets`
                : undefined
            }
          />
          <MetricCard
            label="Auto-redeemed tickets"
            data={toGauge(samples, 'hopr_strategy_auto_redeem_redeem_count')}
          />
          <MetricCard
            label="Channels opened by strategy"
            data={toGauge(samples, 'hopr_strategy_channel_lifecycle_opens')}
            footer={`${formatCompact(latest(samples, 'hopr_strategy_channel_lifecycle_closes'))} closed`}
          />
        </div>
      </Group>
    </Section>
  );
}

export default HealthPage;
