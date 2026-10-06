import { ReactNode } from 'react';
import styled from '@emotion/styled';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import LineChart, { Point } from './LineChart';
import { formatCompact } from '../../utils/format';
import { v } from '../../theme';

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 12px;
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface};
  min-width: 0;
  .head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: ${v.text2};
    svg {
      width: 14px;
      height: 14px;
      color: ${v.text3};
    }
  }
  .value {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: ${v.text};
    font-variant-numeric: tabular-nums;
    .unit {
      font-size: 13px;
      font-weight: 400;
      color: ${v.text3};
      letter-spacing: 0;
    }
  }
  .footer {
    font-size: 12px;
    color: ${v.text3};
  }
`;

/** One metric: label, current value and its recent history. */
export default function MetricCard({
  label,
  hint,
  data,
  unit = '',
  value,
  footer,
  format = (n: number) => formatCompact(n),
}: {
  label: string;
  hint?: ReactNode;
  data?: Point[];
  unit?: string;
  value?: ReactNode;
  footer?: ReactNode;
  format?: (n: number) => string;
}) {
  const last = data && data.length > 0 ? data[data.length - 1].v : null;
  return (
    <Card>
      <div className="head">
        {label}
        {hint && (
          <Tooltip title={hint}>
            <InfoIcon />
          </Tooltip>
        )}
      </div>
      <div className="value">
        {value ?? (last !== null ? format(last) : '-')}
        {unit && <span className="unit">{unit.trim()}</span>}
      </div>
      {data && (
        <LineChart
          data={data}
          label={label}
          unit={unit}
          format={format}
        />
      )}
      {footer && <div className="footer">{footer}</div>}
    </Card>
  );
}
