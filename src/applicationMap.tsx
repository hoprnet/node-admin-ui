import { environment } from '../config';

import { Navigate } from 'react-router-dom';

// Sections
import InfoPage from './pages/node/info';
import HealthPage from './pages/node/health';
import PeersPage from './pages/node/peers';
import ChannelsPage from './pages/node/channels';
import TicketsPage from './pages/node/tickets';
import ConfigurationPage from './pages/node/configuration';
import SessionsPage from './pages/node/sessions';
import SafePage from './pages/safe/nodes';

// Icons
import InfoIcon from '@mui/icons-material/SpaceDashboardOutlined';
import HealthIcon from '@mui/icons-material/MonitorHeartOutlined';
import PeersIcon from '@mui/icons-material/HubOutlined';
import ChannelsIcon from '@mui/icons-material/SwapHoriz';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import NodeIcon from '@mui/icons-material/RouterOutlined';
import NetworkingIcon from '@mui/icons-material/LanOutlined';
import DevelopIcon from '@mui/icons-material/Code';
import SessionsIcon from '@mui/icons-material/CableOutlined';
import SafeIcon from '@mui/icons-material/ShieldOutlined';

export type ApplicationMapType = {
  groupName: string;
  path: string;
  icon: JSX.Element;
  mobileOnly?: boolean | null;
  items: {
    name?: string;
    path: string;
    overwritePath?: string;
    icon?: JSX.Element;
    element?: JSX.Element;
    inDrawer?: boolean | null;
    loginNeeded?: 'node' | 'web3' | 'safe';
    onClick?: () => void;
    mobileOnly?: boolean | null;
    numberKey?: string;
    fetchingKey?: string;
  }[];
}[];

export const applicationMapNode: ApplicationMapType = [
  {
    groupName: 'Node',
    path: 'node',
    icon: <NodeIcon />,
    items: [
      {
        name: 'Overview',
        path: 'info',
        icon: <InfoIcon />,
        element: <InfoPage />,
        loginNeeded: 'node',
      },
      {
        name: 'Health',
        path: 'health',
        icon: <HealthIcon />,
        element: <HealthPage />,
        loginNeeded: 'node',
      },
      {
        name: 'Tickets',
        path: 'tickets',
        icon: <ConfirmationNumberIcon />,
        element: <TicketsPage />,
        loginNeeded: 'node',
      },
      {
        name: 'Settings',
        path: 'configuration',
        icon: <SettingsIcon />,
        element: <ConfigurationPage />,
        loginNeeded: 'node',
      },
    ],
  },
  {
    groupName: 'Network',
    path: 'networking',
    icon: <NetworkingIcon />,
    items: [
      {
        name: 'Peers',
        path: 'peers',
        icon: <PeersIcon />,
        element: <PeersPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfPeers',
        fetchingKey: 'fetchingPeers',
      },
      {
        name: 'Channels',
        path: 'channels',
        icon: <ChannelsIcon />,
        element: <ChannelsPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfChannels',
        fetchingKey: 'fetchingChannels',
      },
      {
        name: 'Sessions',
        path: 'sessions',
        icon: <SessionsIcon />,
        element: <SessionsPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfSessions',
        fetchingKey: 'fetchingSessions',
      },
      // pages merged into the ones above, kept as redirects for old links
      {
        path: 'aliases',
        element: (
          <Navigate
            to="/networking/peers?view=book"
            replace
          />
        ),
        inDrawer: false,
      },
      {
        path: 'channels-INCOMING',
        element: (
          <Navigate
            to="/networking/channels?direction=in"
            replace
          />
        ),
        inDrawer: false,
      },
      {
        path: 'channels-OUTGOING',
        element: (
          <Navigate
            to="/networking/channels?direction=out"
            replace
          />
        ),
        inDrawer: false,
      },
    ],
  },
  {
    groupName: 'Safe',
    path: 'safe',
    icon: <SafeIcon />,
    items: [
      {
        name: 'Safe',
        path: 'nodes',
        icon: <SafeIcon />,
        element: <SafePage />,
        loginNeeded: 'node',
      },
    ],
  },
];

export const applicationMapDev: ApplicationMapType = [
  {
    groupName: 'Develop',
    path: 'steps',
    icon: <DevelopIcon />,
    items: [],
  },
];

const createApplicationMap = () => {
  const temp: ApplicationMapType = [];
  if (environment === 'dev' || environment === 'node') applicationMapNode.forEach((elem) => temp.push(elem));
  if (environment === 'dev') applicationMapDev.forEach((elem) => temp.push(elem));
  return temp;
};

export const applicationMap: ApplicationMapType = createApplicationMap();

/**
 * Paths of the routed subpages, built the same way the router builds them.
 * Used to keep the user on the page they are on when they switch node.
 */
export const subpagePaths: string[] = applicationMap.flatMap((group) =>
  group.items
    .filter((item) => item.path && item.element && item.inDrawer !== false)
    .map((item) => `/${item.overwritePath ? item.overwritePath : `${group.path}/${item.path}`}`.replace('//', '/')),
);

export const isNodeSubpage = (pathname: string) => subpagePaths.includes(pathname);
