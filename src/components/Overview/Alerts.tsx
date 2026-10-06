import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import DangerIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import OkIcon from '@mui/icons-material/CheckCircleOutline';
import { useNodeAlerts } from '../../hooks/useNodeAlerts';
import { v } from '../../theme';

const List = styled.section`
  display: flex;
  flex-direction: column;
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface};
  overflow: hidden;
  .head {
    padding: 11px 16px;
    border-bottom: 1px solid ${v.border};
    font-size: 13.5px;
    font-weight: 600;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  & + & {
    border-top: 1px solid ${v.border};
  }
  > svg {
    width: 18px;
    height: 18px;
    margin-top: 1px;
    flex-shrink: 0;
  }
  &.danger > svg {
    color: ${v.danger};
  }
  &.warning > svg {
    color: ${v.warning};
  }
  &.info > svg,
  &.ok > svg {
    color: ${v.text3};
  }
  &.ok > svg {
    color: ${v.success};
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    min-width: 0;
  }
  .title {
    font-size: 13.5px;
    font-weight: 500;
    color: ${v.text};
  }
  .description {
    font-size: 13px;
    color: ${v.text2};
  }
  .action {
    align-self: center;
    flex-shrink: 0;
    font-size: 12.5px;
    font-weight: 500;
    padding: 5px 10px;
    border: 1px solid ${v.border};
    border-radius: 6px;
    color: ${v.text};
    white-space: nowrap;
    &:hover {
      background: ${v.surface2};
    }
  }
`;

const icons = { danger: <DangerIcon />, warning: <WarningIcon />, info: <InfoIcon /> };

/** Conditions that need attention, each with a way to fix it. */
export default function Alerts() {
  const alerts = useNodeAlerts();

  if (alerts.length === 0) {
    return (
      <List>
        <Item className="ok">
          <OkIcon />
          <span className="text">
            <span className="title">Everything looks good</span>
            <span className="description">Connectivity, balances and allowance are within healthy ranges.</span>
          </span>
        </Item>
      </List>
    );
  }

  return (
    <List aria-label="Needs attention">
      <div className="head">Needs attention</div>
      {alerts.map((alert) => (
        <Item
          key={alert.id}
          className={alert.tone}
        >
          {icons[alert.tone]}
          <span className="text">
            <span className="title">{alert.title}</span>
            <span className="description">{alert.description}</span>
          </span>
          {alert.action?.to && (
            <Link
              className="action"
              to={alert.action.to}
            >
              {alert.action.label}
            </Link>
          )}
          {alert.action?.href && (
            <a
              className="action"
              href={alert.action.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {alert.action.label} ↗
            </a>
          )}
        </Item>
      ))}
    </List>
  );
}
