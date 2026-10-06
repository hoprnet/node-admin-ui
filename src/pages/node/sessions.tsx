import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector, useReadOnly } from '../../store';
import type { GetSessionsResponseType } from '@hoprnet/hopr-sdk';
import ConfirmDialog from '../../components/Modal/ConfirmDialog';
import { Address, StatusPill } from '../../components/Data';
import { actionsAsync } from '../../store/slices/node/actionsAsync';
import { exportToCsv } from '../../utils/helpers';
import { sendNotification } from '../../hooks/useWatcher/notifications';
import { utils as hoprdUtils } from '@hoprnet/hopr-sdk';
const { sdkApiError } = hoprdUtils;

// HOPR Components
import Section from '../../future-hopr-lib-components/Section';
import { SubpageTitle } from '../../components/SubpageTitle';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import TablePro from '../../future-hopr-lib-components/Table/table-pro';

// Modals
import { OpenSessionModal } from '../../components/Modal/node/OpenSessionModal';
import { PingModal } from '../../components/Modal/node/PingModal';

// Mui
import GetAppIcon from '@mui/icons-material/GetApp';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';

const Hop = styled.div`
  display: inline-flex;
  align-items: center;
  margin: 2px;
  height: 18px;
`;

function SessionsPage() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((store) => store.node.sessions.data) || [];
  const sessionsFetching = useAppSelector((store) => store.node.sessions.isFetching);
  const loginData = useAppSelector((store) => store.auth.loginData);
  const aliases = useAppSelector((store) => store.node.aliases);
  const readOnly = useReadOnly();
  const [toClose, set_toClose] = useState<GetSessionsResponseType[number] | null>(null);
  const apiEndpoint = loginData.apiEndpoint;
  const apiToken = loginData.apiToken;

  useEffect(() => {
    handleRefresh();
  }, [apiEndpoint, apiToken]);

  const handleRefresh = () => {
    if (!apiEndpoint) return;
    dispatch(
      actionsAsync.getSessionsThunk({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
  };

  const handleExport = () => {
    if (sessions && sessions.length > 0) {
      exportToCsv(sessions, `sessions.csv`);
    }
  };

  const header = [
    { key: 'destinationCell', name: 'Destination', sortKey: 'destination' },
    { key: 'destination', name: 'Destination', search: true, hidden: true },
    { key: 'listener', name: 'Listening on', sortKey: 'listenerText', width: '220px' },
    { key: 'listenerText', name: 'Listening on', search: true, hidden: true },
    { key: 'target', name: 'Target', search: true, copy: true },
    { key: 'path', name: 'Path', width: '180px' },
    { key: 'mtu', name: 'MTU', align: 'right' as const, width: '80px' },
    { key: 'actions', name: '', width: '56px' },
  ];

  const describePath = (path: unknown) =>
    JSON.stringify(path)
      .replace(/{|}|\[|\]|"/g, '')
      .replace(/:/g, ' ')
      .replace(/,/g, ', ');

  const handleCloseSession = (protocol: 'udp' | 'tcp', listeningIp: string, port: number) => {
    console.log('handleCloseSession', protocol, listeningIp, port);
    dispatch(
      actionsAsync.closeSessionThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ? loginData.apiToken : '',
        protocol,
        listeningIp,
        port,
      }),
    )
      .unwrap()
      .catch(async (e) => {
        const isCurrentApiEndpointTheSame = await dispatch(
          actionsAsync.isCurrentApiEndpointTheSame(loginData.apiEndpoint!),
        ).unwrap();
        if (!isCurrentApiEndpointTheSame) return;

        let errMsg = `Closing of ${protocol} session to ${listeningIp}:${port} failed`;
        if (e instanceof sdkApiError && e.hoprdErrorPayload?.status)
          errMsg = errMsg + `.\n${e.hoprdErrorPayload.status}`;
        if (e instanceof sdkApiError && e.hoprdErrorPayload?.error) errMsg = errMsg + `.\n${e.hoprdErrorPayload.error}`;
        console.error(errMsg, e);
        sendNotification({
          notificationPayload: {
            source: 'node',
            name: errMsg,
            url: null,
            timeout: null,
          },
          toastPayload: { message: errMsg },
          dispatch,
        });
      })
      .finally(() => {
        handleRefresh();
      });
  };

  const parsedTableData = sessions.map((session, index) => {
    const listenerText = `${session.ip}:${session.port} ${session.protocol}`;
    return {
      id: index + 1,
      key: session.target + index,
      destination: `${aliases?.[session.destination] ?? ''} ${session.destination}`,
      destinationCell: <Address address={session.destination} />,
      listenerText,
      listener: (
        <span className="mono">
          {session.ip}:{session.port} <StatusPill tone="neutral">{session.protocol.toUpperCase()}</StatusPill>
        </span>
      ),
      target: <span className="mono">{session.target}</span>,
      mtu: session.hoprMtu,
      path: (
        <span style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'normal' }}>
          → {describePath(session.forwardPath)}
          <br />← {describePath(session.returnPath)}
        </span>
      ),
      actions: readOnly ? (
        <span />
      ) : (
        <IconButton
          iconComponent={<PhoneDisabledIcon />}
          tooltipText="Close session"
          onClick={() => set_toClose(session)}
        />
      ),
    };
  });

  return (
    <Section
      className="Channels--aliases"
      id="Channels--aliases"
      fullHeightMin
    >
      <SubpageTitle
        title="Sessions"
        count={sessions ? sessions.length : null}
        actions={
          <>
            <IconButton
              iconComponent={<GetAppIcon />}
              tooltipText={<span>Export sessions channels as a CSV</span>}
              disabled={!sessions || Object.keys(sessions).length === 0}
              onClick={handleExport}
            />
            <OpenSessionModal />
          </>
        }
      />
      <TablePro
        data={parsedTableData}
        id={'node-sessions-in-table'}
        header={header}
        search
        loading={parsedTableData.length === 0 && sessionsFetching}
        emptyText="No open sessions"
        orderByDefault="destinationCell"
      />
      <ConfirmDialog
        open={!!toClose}
        title="Close session"
        description="Clients connected through this session lose their connection."
        summary={
          toClose
            ? [
                {
                  label: 'Destination',
                  value: (
                    <Address
                      address={toClose.destination}
                      tools={false}
                    />
                  ),
                },
                { label: 'Listening on', value: `${toClose.ip}:${toClose.port} (${toClose.protocol.toUpperCase()})` },
                { label: 'Target', value: toClose.target },
              ]
            : []
        }
        confirmLabel="Close session"
        danger
        onConfirm={() => {
          if (toClose) handleCloseSession(toClose.protocol, toClose.ip, toClose.port);
          set_toClose(null);
        }}
        onClose={() => set_toClose(null)}
      />
    </Section>
  );
}

export default SessionsPage;
