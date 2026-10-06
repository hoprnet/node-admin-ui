import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWatcher } from '../../hooks';

// Mui
import MuiIconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// HOPR Components
import IconButton from '../../future-hopr-lib-components/Button/IconButton';

// Store
import { useAppDispatch, useAppSelector } from '../../store';
import { appActions } from '../../store/slices/app';
import { v } from '../../theme';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const SBadge = styled(Badge)`
  .MuiBadge-badge {
    top: 7px;
    right: 7px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 600;
    background-color: ${v.accent};
    color: ${v.accentContrast};
    box-shadow: 0 0 0 2px ${v.surface};
  }
`;

const SIconButton = styled(MuiIconButton)``;

const SMenuItem = styled(MenuItem)`
  width: 100%;
  max-width: 360px;
  min-width: 280px;
  padding: 10px 28px 10px 12px;
  white-space: break-spaces;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.45;
  color: ${v.text};
  position: relative;
  &.unreadMenuItem {
    font-weight: 500;
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 6px;
      height: 6px;
      right: 12px;
      top: 50%;
      margin-top: -3px;
      border-radius: 50%;
      background-color: ${v.accent};
    }
  }
  &.informational {
    font-size: 12px;
    color: ${v.text3};
    cursor: default;
    pointer-events: none;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid ${v.border};
    border-radius: 0;
    margin-bottom: 4px;
    padding-right: 6px;
    button {
      pointer-events: all;
    }
  }
`;

export default function NotificationBar() {
  // start watching notifications
  useWatcher({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchParams = useLocation()?.search;
  const { notifications } = useAppSelector((store) => store.app);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (notification: (typeof notifications)[0]) => {
    setAnchorEl(null);
    dispatch(appActions.markSeenAllNotifications());
  };

  return (
    <Container>
      <SBadge
        id="notification-menu-button"
        badgeContent={notifications.filter((notification) => !notification.seen).length}
        color="secondary"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <SIconButton aria-label="Notifications">
          <NotificationsNoneIcon />
        </SIconButton>
      </SBadge>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notification-menu-button',
          className: 'notification-menu-list',
        }}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {notifications.length > 0 && (
          <SMenuItem
            className={'informational'}
            //            style={{ maxWidth: 'calc(100% - 17px)'}} //TODO: Fix notification drodown styling if we have more notifications than fit can on the screen
            // https://github.com/hoprnet/hopr-admin/issues/567
          >
            Stored locally, cleared on refresh.
            <IconButton
              iconComponent={<DeleteIcon />}
              tooltipText="Clear all"
              onClick={() => {
                dispatch(appActions.clearNotifications());
              }}
            />
          </SMenuItem>
        )}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <SMenuItem
              className={!notification.interacted ? 'unreadMenuItem' : ''}
              key={notification.id}
              //              style={{ maxWidth: 'calc(100% - 17px)'}}
              onClick={() => {
                dispatch(appActions.interactedWithNotification(notification.id));
                if (notification.url) {
                  navigate(`${notification.url}${searchParams ? searchParams : ''}`);
                }
              }}
            >
              {notification.name}
            </SMenuItem>
          ))
        ) : (
          <SMenuItem>No notifications</SMenuItem>
        )}
      </Menu>
    </Container>
  );
}
