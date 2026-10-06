import styled from '@emotion/styled';
import { Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector } from '../../store';
import { Address, Amount, StatusPill, humanize, toneOf } from '../Data';
import { LastSeen } from '../LastSeen';
import { usePeerActions, usePeerChannels } from './usePeerActions';
import { HOPR_TOKEN_USED } from '../../../config';
import { layout, v } from '../../theme';

const Panel = styled.aside`
  width: 420px;
  max-width: 100vw;
  padding-top: ${layout.navBarHeight}px;
  box-sizing: border-box;
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 18px 16px 16px 20px;
    border-bottom: 1px solid ${v.border};
    .Address .alias {
      font-size: 15px;
      font-weight: 600;
    }
    .Address img.jazz {
      width: 32px;
      height: 32px;
    }
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 14px 20px;
    border-bottom: 1px solid ${v.border};
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border: 1px solid ${v.border};
      border-radius: 6px;
      background: ${v.surface};
      color: ${v.text};
      font-size: 12.5px;
      cursor: pointer;
      svg {
        width: 15px;
        height: 15px;
        color: ${v.text2};
      }
      &:hover {
        background: ${v.surface2};
        border-color: ${v.borderStrong};
      }
      &.danger,
      &.danger svg {
        color: ${v.danger};
      }
    }
  }
  section {
    padding: 16px 20px 4px;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 500;
    color: ${v.text3};
  }
  dl {
    margin: 0;
    div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 7px 0;
      border-bottom: 1px solid ${v.border};
      font-size: 13px;
    }
    div:last-of-type {
      border-bottom: 0;
    }
    dt {
      color: ${v.text2};
    }
    dd {
      margin: 0;
      text-align: right;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .mono {
      font-size: 12px;
    }
  }
  .muted {
    font-size: 13px;
    color: ${v.text3};
    padding: 4px 0 8px;
  }
`;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

/** Side panel with everything known about one peer, and its actions. */
export default function PeerPanel({ address, onClose }: { address: string | null; onClose: () => void }) {
  const connected = useAppSelector((store) => (address ? store.node.peersConnected.parsed.obj[address] ?? null : null));
  const announced = useAppSelector((store) => (address ? store.node.peersAnnounced.parsed.obj[address] ?? null : null));
  const allSessions = useAppSelector((store) => store.node.sessions.data);
  const sessions = (allSessions ?? []).filter((session) => session.destination === address);
  const { outgoing, incoming } = usePeerChannels(address);
  const { actions, dialogs } = usePeerActions(address);

  return (
    <Drawer
      anchor="right"
      open={!!address}
      onClose={onClose}
    >
      {address && (
        <Panel>
          <div className="head">
            <Address
              address={address}
              full
            />
            <IconButton
              size="small"
              aria-label="Close details"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          {actions.length > 0 && (
            <div className="actions">
              {actions.map((action) => (
                <button
                  key={action.key}
                  className={action.danger ? 'danger' : ''}
                  onClick={action.run}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <section>
            <h3>Connection</h3>
            <dl>
              <Row label="Status">
                <StatusPill tone={connected ? 'success' : 'neutral'}>
                  {connected ? 'Connected' : 'Not connected'}
                </StatusPill>
              </Row>
              {connected && (
                <>
                  <Row label="Quality score">
                    <span className="mono">{Math.round(connected.score * 1000) / 10}%</span>
                  </Row>
                  <Row label="Average latency">
                    <span className="mono">
                      {connected.averageLatency !== null && connected.averageLatency !== undefined
                        ? `${connected.averageLatency} ms`
                        : '-'}
                    </span>
                  </Row>
                  <Row label="Probe rate">
                    <span className="mono">{Math.round(connected.probeRate * 1000) / 10}%</span>
                  </Row>
                  <Row label="Last update">
                    <LastSeen timestamp={connected.lastUpdate} />
                  </Row>
                </>
              )}
              {announced?.multiaddrs?.map((multiaddr) => (
                <Row
                  key={multiaddr}
                  label="Announced at"
                >
                  <span className="mono">{multiaddr}</span>
                </Row>
              ))}
            </dl>
          </section>
          <section>
            <h3>Channels</h3>
            <dl>
              <Row label="Outgoing">
                {outgoing ? (
                  <>
                    <Amount
                      value={outgoing.balance}
                      unit={HOPR_TOKEN_USED}
                    />{' '}
                    <StatusPill tone={toneOf(outgoing.status)}>
                      {outgoing.isClosing ? 'Closing…' : humanize(outgoing.status)}
                    </StatusPill>
                  </>
                ) : (
                  <span className="muted">None</span>
                )}
              </Row>
              <Row label="Incoming">
                {incoming ? (
                  <>
                    <Amount
                      value={incoming.balance}
                      unit={HOPR_TOKEN_USED}
                    />{' '}
                    <StatusPill tone={toneOf(incoming.status)}>{humanize(incoming.status)}</StatusPill>
                  </>
                ) : (
                  <span className="muted">None</span>
                )}
              </Row>
            </dl>
          </section>
          <section>
            <h3>Sessions</h3>
            {sessions.length === 0 ? (
              <div className="muted">No open session to this peer.</div>
            ) : (
              <dl>
                {sessions.map((session) => (
                  <Row
                    key={`${session.protocol}-${session.ip}-${session.port}`}
                    label={session.protocol.toUpperCase()}
                  >
                    <span className="mono">
                      {session.ip}:{session.port} → {session.target}
                    </span>
                  </Row>
                ))}
              </dl>
            )}
          </section>
          {dialogs}
        </Panel>
      )}
    </Drawer>
  );
}
