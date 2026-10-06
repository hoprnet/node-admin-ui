import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { toRate } from '../../utils/prometheus';
import { formatCompact } from '../../utils/format';
import MetricCard from '../Charts/MetricCard';
import { v } from '../../theme';

const Wrap = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
    }
    a {
      font-size: 12.5px;
      color: ${v.text2};
      &:hover {
        color: ${v.accentText};
      }
    }
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
`;

const perSecond = (n: number) => (n < 10 ? n.toFixed(2) : formatCompact(n));

/** Packet rates since the dashboard was opened. */
export default function Activity() {
  const samples = useAppSelector((store) => store.ui.metricsHistory);
  return (
    <Wrap>
      <div className="head">
        <h3>Activity</h3>
        <Link to="/node/health">All metrics →</Link>
      </div>
      <div className="grid">
        <MetricCard
          label="Packets relayed"
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
      </div>
    </Wrap>
  );
}
