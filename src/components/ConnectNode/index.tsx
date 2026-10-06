import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import { toHexMD5, generateBase64Jazz } from '../../utils/functions';

// Components
import Modal from './modal';

// Store
import { useAppDispatch, useAppSelector } from '../../store';
import { authActions } from '../../store/slices/auth';
import { nodeActions } from '../../store/slices/node';
import { blokliActions } from '../../store/slices/blokli';
import { appActions } from '../../store/slices/app';

//MUI
import { Button, MenuItem, CircularProgress, Popover, Switch, ListItemIcon } from '@mui/material';
import SwapIcon from '@mui/icons-material/SwapHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import Details from '../InfoBar/details';
import { Address, StatusPill, toneOf } from '../Data';
import { uiActions } from '../../store/slices/ui';
import { useReadOnly } from '../../store';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { abortAllPending } from '../../store/abortRegistry';
import { clearSession } from '../../utils/session';
import { v } from '../../theme';

const Container = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  max-width: 260px;
  padding: 0 8px 0 6px;
  margin-left: 6px;
  border: 1px solid ${v.border};
  border-radius: 6px;
  background: ${v.surface};
  color: ${v.text};
  &:hover {
    background: ${v.surface2};
    border-color: ${v.borderStrong};
  }
  &.disconnected {
    padding: 0 12px;
    background: ${v.accent};
    border-color: ${v.accent};
    color: ${v.accentContrast};
    &:hover {
      background: ${v.accentHover};
    }
  }
  .image-container {
    display: flex;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      bottom: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid ${v.surface};
      background: ${v.text3};
    }
    &.status-Green::after {
      background: ${v.success};
    }
    &.status-Yellow::after,
    &.status-Orange::after {
      background: ${v.warning};
    }
    &.status-Red::after {
      background: ${v.danger};
    }
    img {
      height: 22px;
      width: 22px;
      border-radius: 50%;
    }
  }
`;

const NodeButton = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  text-align: left;
  .labels {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  p {
    margin: 0;
  }
  .node-info {
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 15px;
    color: ${v.text2};
    white-space: nowrap;
  }
  .node-info-localname {
    font-family: var(--font-sans);
    font-size: 12.5px;
    font-weight: 600;
    line-height: 15px;
    color: ${v.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 560px) {
    .labels,
    .ro-badge {
      display: none;
    }
  }
  .ro-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 4px;
    background: ${v.warningSoft};
    color: ${v.warning};
    white-space: nowrap;
  }
  .dropdown-icon {
    display: flex;
    color: ${v.text3};
    svg {
      width: 18px;
      height: 18px;
    }
  }
  &.connect {
    font-size: 13.5px;
    font-weight: 500;
  }
`;

const NodePanel = styled.div`
  width: 300px;
  .identity {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 14px 14px 12px;
    .name {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    .network {
      font-size: 12px;
      color: ${v.text3};
    }
  }
  .readonly {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-top: 1px solid ${v.border};
    font-size: 13px;
    cursor: pointer;
    small {
      display: block;
      font-size: 12px;
      color: ${v.text3};
    }
  }
  .actions {
    padding: 4px;
    border-top: 1px solid ${v.border};
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  color: ${v.text2};
  background: color-mix(in srgb, ${v.bg} 80%, transparent);
  backdrop-filter: blur(4px);
  z-index: 10000;
`;

export default function ConnectNode() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [modalVisible, set_modalVisible] = useState(false);
  const connected = useAppSelector((store) => store.auth.status.connected);
  const connecting = useAppSelector((store) => store.auth.status.connecting);
  const error = useAppSelector((store) => store.auth.status.error);
  const openLoginModalToNode = useAppSelector((store) => store.auth.helper.openLoginModalToNode);
  const peerAddress = useAppSelector((store) => store.node.addresses.data.native);
  const localNameFromLocalStorage = useAppSelector((store) => store.auth.loginData.localName);
  const jazzIconFromLocalStorage = useAppSelector((store) => store.auth.loginData.jazzIcon);
  const localNameToDisplay =
    localNameFromLocalStorage && localNameFromLocalStorage.length > 17
      ? `${localNameFromLocalStorage?.substring(0, 5)}…${localNameFromLocalStorage?.substring(
          localNameFromLocalStorage.length - 11,
          localNameFromLocalStorage.length,
        )}`
      : localNameFromLocalStorage;
  const apiEndpoint = useAppSelector((store) => store.auth.loginData.apiEndpoint);
  const network = useAppSelector((store) => store.node.info.data?.hoprNetworkName);
  const connectivity = useAppSelector((store) => store.node.info.data?.connectivityStatus);
  const readOnly = useReadOnly();
  const [peerAddressIcon, set_peerAddressIcon] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State variable to hold the anchor element for the menu

  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!connected) set_peerAddressIcon(null);
    if (!apiEndpoint) return;
    console.log(jazzIconFromLocalStorage);
    const md5 = toHexMD5(apiEndpoint);
    const b64 = generateBase64Jazz(
      peerAddress ? peerAddress : jazzIconFromLocalStorage ? jazzIconFromLocalStorage : md5,
    );
    if (connected && b64) set_peerAddressIcon(b64);
  }, [connected, apiEndpoint, peerAddress, jazzIconFromLocalStorage]);

  useEffect(() => {
    if (error) set_modalVisible(true);
  }, [error]);

  useEffect(() => {
    if (openLoginModalToNode) set_modalVisible(true);
  }, [openLoginModalToNode]);

  const handleLogout = () => {
    clearSession();
    abortAllPending();
    dispatch(authActions.resetState());
    dispatch(nodeActions.resetState());
    dispatch(blokliActions.resetState());
    dispatch(appActions.resetNodeState());
    dispatch(appActions.clearNotifications());
    navigate('/');
  };

  // New function to handle opening the menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // New function to handle closing the menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLElement>) => {
    if (connected) {
      handleOpenMenu(event);
    } else {
      handleModalOpen();
      if (anchorEl) {
        // If the menu is open, it means the user clicked outside the menu, so we should close it without disconnecting.
        handleCloseMenu();
      }
    }
  };

  const handleModalClose = () => {
    set_modalVisible(false);
  };

  const handleModalOpen = () => {
    set_modalVisible(true);
  };

  return (
    <>
      <Container
        onClick={handleContainerClick}
        ref={containerRef}
        className={connected ? 'connected' : 'disconnected'}
      >
        {connected && (
          <div
            className={`image-container status-${connectivity}`}
            id="jazz-icon-node"
          >
            <img
              className={`${peerAddressIcon && 'node-jazz-icon-present'}`}
              src={peerAddressIcon ?? '/assets/hopr_logo.svg'}
              alt=""
            />
          </div>
        )}
        {connected ? (
          <>
            <NodeButton>
              <span className="labels">
                {localNameToDisplay && <p className="node-info node-info-localname">{localNameToDisplay}</p>}
                <p className="node-info">
                  {peerAddress && (
                    <>
                      0x{peerAddress.substring(2, 6)}…{peerAddress.substring(peerAddress.length - 4)}
                    </>
                  )}
                </p>
              </span>
              {readOnly && <span className="ro-badge">Read-only</span>}
              <div className="dropdown-icon">
                <ExpandMoreIcon />
              </div>
            </NodeButton>
            <Popover
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: -6, horizontal: 'right' }}
              disableScrollLock={true}
              onClick={(event) => event.stopPropagation()}
            >
              <NodePanel>
                <div className="identity">
                  <div className="name">
                    {localNameFromLocalStorage || 'Node'}
                    {connectivity && <StatusPill tone={toneOf(connectivity)}>{connectivity}</StatusPill>}
                  </div>
                  <Address
                    address={peerAddress}
                    alias={null}
                    icon={false}
                  />
                  {network && <div className="network">{network}</div>}
                </div>
                <Details
                  hideHeader
                  style={{ border: 0, borderRadius: 0, borderTop: `1px solid var(--border)` }}
                />
                <label className="readonly">
                  <span>
                    Read-only mode
                    <small>Hide every action that changes the node</small>
                  </span>
                  <Switch
                    checked={readOnly}
                    onChange={() =>
                      apiEndpoint && dispatch(uiActions.setReadOnly({ apiEndpoint, readOnly: !readOnly }))
                    }
                  />
                </label>
                <div className="actions">
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      handleModalOpen();
                    }}
                  >
                    <ListItemIcon>
                      <SwapIcon fontSize="small" />
                    </ListItemIcon>
                    Switch node…
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      handleLogout();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Disconnect
                  </MenuItem>
                </div>
              </NodePanel>
            </Popover>
          </>
        ) : (
          <NodeButton className="connect">Connect node</NodeButton>
        )}
      </Container>
      <Modal
        open={!connecting && modalVisible}
        handleClose={handleModalClose}
      />
      {connecting && (
        <Overlay>
          <CircularProgress size={24} />
          Connecting to node…
        </Overlay>
      )}
    </>
  );
}
