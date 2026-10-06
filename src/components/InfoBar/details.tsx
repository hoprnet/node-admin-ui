import { ReactNode } from 'react';
import { useAppSelector } from '../../store';
import styled from '@emotion/styled';
import { formatEther } from 'viem';
import Tooltip from '@mui/material/Tooltip';
import { v } from '../../theme';

interface Props {
  style?: object;
  // embedded where the node name and status are already shown
  hideHeader?: boolean;
}

const Container = styled.section`
  display: flex;
  flex-direction: column;
  background: ${v.surface};
  border: 1px solid ${v.border};
  border-radius: 8px;
  font-size: 12.5px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid ${v.border};
  .label {
    font-size: 13px;
    font-weight: 600;
    color: ${v.text};
  }
`;

const Rows = styled.dl`
  margin: 0;
  padding: 4px 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  dt {
    display: flex;
    align-items: center;
    gap: 7px;
    color: ${v.text2};
    white-space: nowrap;
    min-width: 0;
  }
  dt img {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  dt .unit {
    color: ${v.text3};
  }
  dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${v.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  dd.status-Orange {
    color: ${v.warning};
  }
  dd.status-Red {
    color: ${v.danger};
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  background: ${v.surface2};
  color: ${v.text2};
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  &.status-Green {
    background: ${v.successSoft};
    color: ${v.success};
  }
  &.status-Yellow,
  &.status-Orange {
    background: ${v.warningSoft};
    color: ${v.warning};
  }
  &.status-Red {
    background: ${v.dangerSoft};
    color: ${v.danger};
  }
`;

// Connectivity status as a pill with a coloured dot (Green / Yellow / Orange / Red / Unknown).
export const ColorStatus = ({ className, children }: { className?: string; children?: ReactNode }) =>
  children ? <Pill className={className}>{children}</Pill> : <>-</>;

// Up to 4 decimals for display; the full value stays available in the tooltip.
const short = (value?: string | null) => {
  if (!value || value === '-') return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('en-US', { maximumFractionDigits: n !== 0 && Math.abs(n) < 0.0001 ? 8 : 4 });
};

const Value = ({ value, className }: { value?: string | null; className?: string }) => (
  <Tooltip title={value && value !== '-' && value !== '0' ? value : null}>
    <dd className={className}>{short(value)}</dd>
  </Tooltip>
);

export default function Details(props: Props) {
  const balances = useAppSelector((store) => store.node.balances.data);
  const info = useAppSelector((store) => store.node.info.data);
  // safe wide channel stake, same source as the info page. Blokli only, no fallback
  // to this node's own channels, so it stays honest about what it is showing.
  const safeChannelsOut = useAppSelector((store) => store.blokli.channelStats.data);

  const totalwxHOPR =
    safeChannelsOut?.value && balances.safeHopr?.value
      ? formatEther(BigInt(safeChannelsOut.value) + BigInt(balances.safeHopr?.value))
      : '-';

  const isXdaiEnough = () => {
    if (balances.native.value && BigInt(balances.native.value) < BigInt('1000000000000000')) return 'Red';
    if (balances.native.value && BigInt(balances.native.value) < BigInt('50000000000000000')) return 'Orange';
    return '';
  };

  return (
    <Container style={props.style}>
      <Header style={props.hideHeader ? { display: 'none' } : undefined}>
        <span className="label">Node</span>
        <ColorStatus className={`status-${info?.connectivityStatus}`}>{info?.connectivityStatus}</ColorStatus>
      </Header>
      <Rows>
        <Row>
          <dt>
            <img
              src="/assets/xDaiIcon.svg"
              alt=""
            />
            Node <span className="unit">xDAI</span>
          </dt>
          <Value
            value={balances.native?.formatted}
            className={`status-${isXdaiEnough()}`}
          />
        </Row>
        <Row>
          <dt>
            <img
              src="/assets/wxHoprIcon.svg"
              alt=""
            />
            Safe <span className="unit">wxHOPR</span>
          </dt>
          <Value value={balances.safeHopr?.formatted} />
        </Row>
        <Row>
          <dt>
            <img
              src="/assets/wxHoprIcon.svg"
              alt=""
            />
            Channels <span className="unit">wxHOPR</span>
          </dt>
          <Value value={safeChannelsOut?.formatted} />
        </Row>
        <Row>
          <dt>
            <img
              src="/assets/wxHoprIcon.svg"
              alt=""
            />
            Total <span className="unit">wxHOPR</span>
          </dt>
          <Value value={totalwxHOPR} />
        </Row>
      </Rows>
    </Container>
  );
}
