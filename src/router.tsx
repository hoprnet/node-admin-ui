import { useEffect } from 'react';
import { createBrowserRouter, RouteObject, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import { environment } from '../config';
import { parseAndFormatUrl } from './utils/parseAndFormatUrl';

// Store
import { useAppDispatch, useAppSelector } from './store';
import { authActions, authActionsAsync } from './store/slices/auth';
import { nodeActions, nodeActionsAsync } from './store/slices/node';

// Sections
import NodeLandingPage from './pages/node/landingPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyNotice from './pages/PrivacyNotice';

// Layout
import Layout from './future-hopr-lib-components/Layout';
import ConnectNode from './components/ConnectNode';
import NotificationBar from './components/NotificationBar';
import InfoBar from './components/InfoBar';

import { trackGoal } from 'fathom-client';
import { applicationMap } from './applicationMap';

const LayoutEnhanced = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const nodeConnected = useAppSelector((store) => store.auth.status.connected);
  const loginData = useAppSelector((store) => store.auth.loginData);
  const [searchParams] = useSearchParams();
  const apiEndpoint = searchParams.get('apiEndpoint');
  const apiToken = searchParams.get('apiToken');

  const numberOfPeers = useAppSelector((store) => store.node.peersConnected.data?.length);
  const fetchingPeers = useAppSelector((store) => store.node.peersConnected.isFetching);
  const numberOfAliases = useAppSelector((store) => store.node.aliases && Object.keys(store.node.aliases).length);
  const numberOfMessagesReceived = useAppSelector((store) => store.node.messages.data.length);
  const numberOfChannelsIn = useAppSelector((store) => store.node.channels.data?.incoming.length);
  const numberOfChannelsOut = useAppSelector((store) => store.node.channels.data?.outgoing.length);
  const fetchingChannels = useAppSelector((store) => store.node.channels.isFetching);
  const numberOfSessions = useAppSelector((store) => store.node.sessions.data?.length);
  const fetchingSessions = useAppSelector((store) => store.node.sessions.isFetching);

  const numberForDrawer = {
    numberOfPeers,
    numberOfAliases,
    numberOfMessagesReceived,
    numberOfChannelsIn,
    numberOfChannelsOut,
    numberOfSessions,
  };

  const drawerNumbersLoading = {
    fetchingPeers,
    fetchingChannels,
    fetchingSessions,
  };

  useEffect(() => {
    // console.log('useEffect(()', apiEndpoint, apiToken);
    if (!apiEndpoint) return;
    if (loginData.apiEndpoint === apiEndpoint && loginData.apiToken === apiToken) return;
    const formattedApiEndpoint = parseAndFormatUrl(apiEndpoint);
    console.log('Node Admin login from url', formattedApiEndpoint);
    dispatch(
      authActions.useNodeData({
        apiEndpoint,
        apiToken: apiToken ? apiToken : '',
      }),
    );
    dispatch(nodeActions.setApiEndpoint({ apiEndpoint: formattedApiEndpoint }));
    const useNode = async () => {
      try {
        //  console.log('Node Admin login from router');
        const loginInfo = await dispatch(
          authActionsAsync.loginThunk({
            apiEndpoint,
            apiToken: apiToken ? apiToken : '',
          }),
        ).unwrap();
        if (loginInfo) {
          // We do this after the loginInfo to make sure the login from url was successful
          trackGoal('Y641EPNA', 1); // LOGIN_TO_NODE_BY_URL
          dispatch(
            nodeActionsAsync.isNodeReadyThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getInfoThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getAddressesThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getAnnouncedPeersThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getConnectedPeersThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getBalancesThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getChannelsThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getTicketStatisticsThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getConfigurationThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getPrometheusMetricsThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getTicketPriceThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getMinimumNetworkProbabilityThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
          dispatch(
            nodeActionsAsync.getSessionsThunk({
              apiEndpoint,
              apiToken: apiToken ? apiToken : '',
            }),
          );
        }
      } catch (e) {
        trackGoal('ZUIBL4M8', 1); // FAILED_CONNECT_TO_NODE_BY_URL
        // error is handled on redux
      }
    };
    useNode();
  }, [apiEndpoint, apiToken]);

  const showInfoBar = () => {
    return nodeConnected;
  };

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
      itemsNavbarRight={
        <>
          {(environment === 'dev' || environment === 'node') && <NotificationBar />}
          {(environment === 'dev' || environment === 'node') && <ConnectNode />}
        </>
      }
      drawerRight={showInfoBar() && <InfoBar />}
    />
  );
};

var routes = [
  {
    path: '/',
    element: <LayoutEnhanced />,
    children: [] as RouteObject[],
  },
  {
    path: '*',
    element: (
      <Navigate
        to="/"
        replace
      />
    ),
    children: [] as RouteObject[],
  },
];

applicationMap.map((groups) => {
  groups.items.map((item) => {
    if (environment === 'node') {
      routes[0].children.push({
        path: '/',
        element: <NodeLandingPage />,
      });
    }
    if (item.path && item.element) {
      routes[0].children.push({
        path: item.overwritePath ? item.overwritePath : groups.path + '/' + item.path,
        element: item.element,
      });
    }
  });
});

routes[0].children.push({
  path: '/tos',
  element: <TermsOfService />,
});
routes[0].children.push({
  path: '/privacy-notice',
  element: <PrivacyNotice />,
});

const router = createBrowserRouter(routes);

export default router;
