import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import { useAppSelector } from '../../store';
import { formatAmount, shortAddress } from '../../utils/format';
import { generateBase64Jazz } from '../../utils/functions';
import { v } from '../../theme';

// ---------------------------------------------------------------- Amount

const SAmount = styled.span`
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  white-space: nowrap;
  .unit {
    margin-left: 0.4em;
    color: ${v.text3};
    font-family: var(--font-sans);
    letter-spacing: 0;
  }
`;

/** A token amount: ~4 decimals and thousands separators, the exact value in the tooltip. */
export const Amount = ({
  value,
  unit,
  decimals = 4,
  className,
}: {
  value: string | number | null | undefined;
  unit?: ReactNode;
  decimals?: number;
  className?: string;
}) => {
  const formatted = formatAmount(value, decimals);
  const exact = value === null || value === undefined ? null : String(value);
  return (
    <Tooltip title={exact && exact !== formatted ? exact : ''}>
      <SAmount className={className}>
        {formatted}
        {unit && formatted !== '-' && <span className="unit">{unit}</span>}
      </SAmount>
    </Tooltip>
  );
};

// ---------------------------------------------------------------- CopyButton

const SCopy = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${v.text3};
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    background: ${v.surface3};
    color: ${v.text};
  }
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SIconLink = SCopy.withComponent('a');

const canCopy = () =>
  typeof navigator !== 'undefined' &&
  !!navigator.clipboard &&
  (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));

export const CopyButton = ({ value, label = 'Copy' }: { value: string; label?: string }) => {
  const [copied, set_copied] = useState(false);
  if (!canCopy()) return null;
  return (
    <Tooltip title={copied ? 'Copied' : label}>
      <SCopy
        type="button"
        className="copy-button"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(value);
          set_copied(true);
          setTimeout(() => set_copied(false), 1500);
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </SCopy>
    </Tooltip>
  );
};

// ---------------------------------------------------------------- Address

const SAddress = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  img.jazz {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .labels {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
  }
  .alias {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    color: ${v.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .address {
    font-family: var(--font-mono);
    font-size: 12px;
    color: ${v.text2};
    white-space: nowrap;
  }
  .alias + .address {
    font-size: 11.5px;
    color: ${v.text3};
  }
  .tools {
    display: inline-flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 100ms ease;
  }
  &:hover .tools,
  .tools:focus-within {
    opacity: 1;
  }
  @media (hover: none) {
    .tools {
      opacity: 1;
    }
  }
`;

/**
 * A node / account address: jazzicon, alias first (when known), then the
 * shortened address. Copy and explorer link appear on hover.
 */
export const Address = ({
  address,
  alias,
  full = false,
  icon = true,
  tools = true,
  explorer = true,
}: {
  address: string | null | undefined;
  alias?: string | null;
  full?: boolean;
  icon?: boolean;
  tools?: boolean;
  explorer?: boolean;
}) => {
  const aliases = useAppSelector((store) => store.node.aliases);
  if (!address) return <span>-</span>;
  const name = alias === undefined ? aliases?.[address] : alias;
  const jazz = icon ? generateBase64Jazz(address) : null;
  return (
    <SAddress className="Address">
      {jazz && (
        <img
          className="jazz node-jazz-icon"
          src={jazz}
          alt=""
        />
      )}
      <span className="labels">
        {name && <span className="alias">{name}</span>}
        <Tooltip title={full ? '' : address}>
          <span className="address">{full ? address : shortAddress(address)}</span>
        </Tooltip>
      </span>
      {tools && (
        <span className="tools">
          <CopyButton
            value={address}
            label="Copy address"
          />
          {explorer && (
            <Tooltip title="Open in gnosisscan">
              <SIconLink
                href={`https://gnosisscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                aria-label="Open in gnosisscan"
              >
                <LaunchIcon />
              </SIconLink>
            </Tooltip>
          )}
        </span>
      )}
    </SAddress>
  );
};

// ---------------------------------------------------------------- StatusPill

const SPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: var(--font-sans);
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
  &.success {
    background: ${v.successSoft};
    color: ${v.success};
  }
  &.warning {
    background: ${v.warningSoft};
    color: ${v.warning};
  }
  &.danger {
    background: ${v.dangerSoft};
    color: ${v.danger};
  }
  &.accent {
    background: ${v.accentSoft};
    color: ${v.accentText};
  }
`;

export type Tone = 'success' | 'warning' | 'danger' | 'accent' | 'neutral';

export const StatusPill = ({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) => (
  <SPill className={`StatusPill ${tone}`}>{children}</SPill>
);

/** Tone of the statuses the node reports (connectivity, channel status). */
export const toneOf = (status: string | null | undefined): Tone => {
  switch (status) {
    case 'Green':
    case 'Open':
    case 'Online':
      return 'success';
    case 'Yellow':
    case 'Orange':
    case 'PendingToClose':
      return 'warning';
    case 'Red':
      return 'danger';
    default:
      return 'neutral';
  }
};

/** "PendingToClose" -> "Pending to close" */
export const humanize = (status: string | null | undefined) =>
  status
    ? status
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase())
        .replace(/ ([A-Z])/g, (_, c) => ` ${c.toLowerCase()}`)
    : '-';

// ---------------------------------------------------------------- Segmented

const SSegmented = styled.div`
  display: inline-flex;
  align-self: flex-start;
  padding: 2px;
  gap: 2px;
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface2};
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${v.text2};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    .count {
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: ${v.text3};
    }
    &:hover {
      color: ${v.text};
    }
    &.active {
      background: ${v.surface};
      color: ${v.text};
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 1px ${v.border};
    }
  }
`;

/** Switch between views of the same page (e.g. outgoing / incoming channels). */
export const Segmented = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number | null }[];
  onChange: (value: T) => void;
}) => (
  <SSegmented role="tablist">
    {options.map((option) => (
      <button
        key={option.value}
        role="tab"
        aria-selected={value === option.value}
        className={value === option.value ? 'active' : ''}
        onClick={() => onChange(option.value)}
      >
        {option.label}
        {option.count !== undefined && option.count !== null && <span className="count">{option.count}</span>}
      </button>
    ))}
  </SSegmented>
);

// ---------------------------------------------------------------- Stats

const SStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    font-size: 12px;
    color: ${v.text3};
  }
  .value {
    font-size: 15px;
    font-weight: 500;
    color: ${v.text};
  }
`;

/** A row of small label / value figures above a table. */
export const Stats = ({ items }: { items: { label: string; value: ReactNode }[] }) => (
  <SStats>
    {items.map((item) => (
      <div
        className="stat"
        key={item.label}
      >
        <span className="label">{item.label}</span>
        <span className="value">{item.value}</span>
      </div>
    ))}
  </SStats>
);
