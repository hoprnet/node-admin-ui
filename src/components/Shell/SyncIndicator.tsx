import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ListItemIcon, Menu, MenuItem, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PauseIcon from '@mui/icons-material/PauseCircleOutline';
import PlayIcon from '@mui/icons-material/PlayCircleOutline';
import { useAppDispatch, useAppSelector } from '../../store';
import { uiActions } from '../../store/slices/ui';
import { useRefreshAll } from '../../hooks/useRefreshAll';
import { formatAgo } from '../../utils/format';
import { v } from '../../theme';

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${v.text2};
  font-size: 12.5px;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    background: ${v.surface2};
    color: ${v.text};
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${v.success};
    flex-shrink: 0;
  }
  &.fetching .dot {
    animation: pulse 1s ease-in-out infinite;
  }
  &.paused .dot {
    background: ${v.text3};
  }
  &.error .dot {
    background: ${v.danger};
  }
  @keyframes pulse {
    50% {
      opacity: 0.3;
    }
  }
  @media (max-width: 760px) {
    .label {
      display: none;
    }
  }
`;

const Hint = styled.div`
  padding: 6px 12px 8px;
  font-size: 12px;
  line-height: 1.5;
  color: ${v.text3};
  max-width: 240px;
`;

/** Freshness of the polled node data, with manual refresh and pause. */
export default function SyncIndicator() {
  const dispatch = useAppDispatch();
  const { lastSuccessAt, consecutiveErrors, paused } = useAppSelector((store) => store.ui.sync);
  const connected = useAppSelector((store) => store.auth.status.connected);
  const { refresh, isFetching } = useRefreshAll();
  const [anchorEl, set_anchorEl] = useState<null | HTMLElement>(null);
  const [, set_tick] = useState(0);

  // re-render every 5s so "12s ago" stays current
  useEffect(() => {
    const interval = setInterval(() => set_tick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!connected) return null;

  const failing = consecutiveErrors >= 2;
  const label = paused ? 'Paused' : failing ? 'Unreachable' : `Updated ${formatAgo(lastSuccessAt)}`;

  return (
    <>
      <Trigger
        className={[isFetching && 'fetching', paused && 'paused', failing && 'error'].filter(Boolean).join(' ')}
        onClick={(event) => set_anchorEl(event.currentTarget)}
        aria-label="Data freshness"
      >
        <span className="dot" />
        <span className="label">{label}</span>
      </Trigger>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => set_anchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: -6, horizontal: 'right' }}
        disableScrollLock
      >
        <Hint>
          Data refreshes every 60 s.
          {lastSuccessAt && ` Last update ${formatAgo(lastSuccessAt)}.`}
        </Hint>
        <Divider />
        <MenuItem
          onClick={() => {
            refresh();
            set_anchorEl(null);
          }}
        >
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          Refresh now
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(uiActions.setPaused(!paused));
            set_anchorEl(null);
          }}
        >
          <ListItemIcon>{paused ? <PlayIcon fontSize="small" /> : <PauseIcon fontSize="small" />}</ListItemIcon>
          {paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
        </MenuItem>
      </Menu>
    </>
  );
}
