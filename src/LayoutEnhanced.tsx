import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { loadSession, saveSession } from './utils/session';

import { environment } from '../config';
import { parseAndFormatUrl } from './utils/parseAndFormatUrl';

import { useAppDispatch, useAppSelector } from './store';
import { authActions, authActionsAsync } from './store/slices/auth';
import { nodeActions } from './store/slices/node';
import { fetchNodeData } from './store/slices/node/fetchNodeData';

import Layout from './future-hopr-lib-components/Layout';
import ConnectNode from './components/ConnectNode';
import NotificationBar from './components/NotificationBar';
import SyncIndicator from './components/Shell/SyncIndicator';
import HelpPanel from './components/Shell/HelpPanel';
import CommandPalette from './components/Shell/CommandPalette';

import { applicationMap } from './applicationMap';

const LayoutEnhanced = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const nodeConnected = useAppSelector((store) => store.auth.status.connected);
  const loginData = useAppSelector((store) => store.auth.loginData);
  const [searchParams, set_searchParams] = useSearchParams();
  const urlApiEndpoint = searchParams.get('apiEndpoint');
  const urlApiToken = searchParams.get('apiToken');

  const numberOfPeers = useAppSelector((store) => store.node.peersConnected.data?.length);
  const fetchingPeers = useAppSelector((store) => store.node.peersConnected.isFetching);
  const numberOfAliases = useAppSelector((store) => store.node.aliases && Object.keys(store.node.aliases).length);
  const numberOfMessagesReceived = useAppSelector((store) => store.node.messages.data.length);
  const numberOfChannelsIn = useAppSelector((store) => store.node.channels.data?.incoming.length);
  const numberOfChannelsOut = useAppSelector((store) => store.node.channels.data?.outgoing.length);
  const fetchingChannels = useAppSelector((store) => store.node.channels.isFetching);
  const numberOfSessions = useAppSelector((store) => store.node.sessions.data?.length);
  const fetchingSessions = useAppSelector((store) => store.node.sessions.isFetching);
  const numberOfSafeNodes = useAppSelector((store) => store.blokli.safeNodes.data?.length);
  const fetchingSafeNodes = useAppSelector((store) => store.blokli.safeNodes.isFetching);

  const numberOfChannels =
    numberOfChannelsIn !== undefined && numberOfChannelsOut !== undefined
      ? numberOfChannelsIn + numberOfChannelsOut
      : undefined;

  const numberForDrawer = {
    numberOfChannels,
    numberOfPeers,
    numberOfAliases,
    numberOfMessagesReceived,
    numberOfChannelsIn,
    numberOfChannelsOut,
    numberOfSessions,
    numberOfSafeNodes,
  };

  const drawerNumbersLoading = {
    fetchingPeers,
    fetchingChannels,
    fetchingSessions,
    fetchingSafeNodes,
  };

  // Login from the URL (?apiEndpoint=&apiToken=) or from this tab's session.
  // The credentials are removed from the URL right away so the token does not
  // stay in the browser history or in links shared from the address bar.
  useEffect(() => {
    const session = loadSession();
    const apiEndpoint = urlApiEndpoint ?? session?.apiEndpoint;
    const apiToken = urlApiEndpoint ? urlApiToken ?? '' : session?.apiToken ?? '';
    if (urlApiEndpoint || urlApiToken) {
      const rest = new URLSearchParams(searchParams);
      rest.delete('apiEndpoint');
      rest.delete('apiToken');
      set_searchParams(rest, { replace: true });
    }
    if (!apiEndpoint) return;
    if (loginData.apiEndpoint === apiEndpoint && loginData.apiToken === apiToken) return;
    const formattedApiEndpoint = parseAndFormatUrl(apiEndpoint);
    if (!formattedApiEndpoint) return;
    console.log('Node Admin login from', urlApiEndpoint ? 'url' : 'session', formattedApiEndpoint);
    dispatch(authActions.useNodeData({ apiEndpoint, apiToken }));
    dispatch(nodeActions.setApiEndpoint({ apiEndpoint: formattedApiEndpoint }));
    const useNode = async () => {
      try {
        const loginInfo = await dispatch(authActionsAsync.loginThunk({ apiEndpoint, apiToken })).unwrap();
        if (loginInfo) {
          saveSession({ apiEndpoint: formattedApiEndpoint, apiToken });
          fetchNodeData({
            apiEndpoint: formattedApiEndpoint,
            apiToken,
            dispatch,
          });
        }
      } catch (e) {
        // error is handled in redux
      }
    };
    useNode();
  }, []);

  return (
    <Layout
      drawer
      webapp
      drawerItems={applicationMap}
      drawerFunctionItems={undefined}
      drawerNumbers={numberForDrawer}
      drawerNumbersLoading={drawerNumbersLoading}
      drawerLoginState={{ node: nodeConnected }}
      className={environment}
      drawerType={undefined}
      itemsNavbarCenter={<CommandPalette />}
      itemsNavbarRight={
        <>
          <SyncIndicator />
          <HelpPanel />
          {(environment === 'dev' || environment === 'node') && <NotificationBar />}
          {(environment === 'dev' || environment === 'node') && <ConnectNode />}
        </>
      }
    />
  );
};

export default LayoutEnhanced;
