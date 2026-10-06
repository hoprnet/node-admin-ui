import { environment } from '../config';

// Sections
import AliasesPage from './pages/node/aliases';
import InfoPage from './pages/node/info';
import PeersPage from './pages/node/peers';
import TicketsPage from './pages/node/tickets';
import ChannelsPageIncoming from './pages/node/channelsIncoming';
import ChannelsPageOutgoing from './pages/node/channelsOutgoing';
import ConfigurationPage from './pages/node/configuration';
import SessionsPage from './pages/node/sessions';
import SafeNodesPage from './pages/safe/nodes';

// Icons
import InfoIcon from '@mui/icons-material/InfoOutlined';
import PeersIcon from '@mui/icons-material/HubOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import AliasesIcon from '@mui/icons-material/ContactsOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import NodeIcon from '@mui/icons-material/RouterOutlined';
import NetworkingIcon from '@mui/icons-material/LanOutlined';
import DevelopIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import DocsIcon from '@mui/icons-material/MenuBookOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import IncomingChannelsIcon from '@mui/icons-material/CallReceived';
import OutgoingChannelsIcon from '@mui/icons-material/CallMade';
import SessionsIcon from '@mui/icons-material/CableOutlined';
import SafeIcon from '@mui/icons-material/ShieldOutlined';
import SafeNodesIcon from '@mui/icons-material/DnsOutlined';

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
        name: 'Tickets',
        path: 'tickets',
        icon: <ConfirmationNumberIcon />,
        element: <TicketsPage />,
        loginNeeded: 'node',
      },
      {
        name: 'Configuration',
        path: 'configuration',
        icon: <SettingsIcon />,
        element: <ConfigurationPage />,
        loginNeeded: 'node',
      },
    ],
  },
  {
    groupName: 'Networking',
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
        name: 'Aliases',
        path: 'aliases',
        icon: <AliasesIcon />,
        element: <AliasesPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfAliases',
      },
      {
        name: 'Incoming channels',
        path: 'channels-INCOMING',
        icon: <IncomingChannelsIcon />,
        element: <ChannelsPageIncoming />,
        loginNeeded: 'node',
        numberKey: 'numberOfChannelsIn',
        fetchingKey: 'fetchingChannels',
      },
      {
        name: 'Outgoing channels',
        path: 'channels-OUTGOING',
        icon: <OutgoingChannelsIcon />,
        element: <ChannelsPageOutgoing />,
        loginNeeded: 'node',
        numberKey: 'numberOfChannelsOut',
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
    ],
  },
  {
    groupName: 'Safe',
    path: 'safe',
    icon: <SafeIcon />,
    items: [
      {
        name: 'Nodes',
        path: 'nodes',
        icon: <SafeNodesIcon />,
        element: <SafeNodesPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfSafeNodes',
        fetchingKey: 'fetchingSafeNodes',
      },
    ],
  },
  {
    groupName: 'Resources',
    path: 'links',
    icon: <LinkIcon />,
    items: [
      {
        name: 'Staking Hub',
        path: 'https://hub.hoprnet.org/',
        icon: <SavingsIcon />,
      },
      {
        name: 'Docs',
        path: 'https://docs.hoprnet.org/',
        icon: <DocsIcon />,
      },
      {
        name: 'Telegram',
        path: 'https://t.me/hoprnet',
        icon: <TelegramIcon />,
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
    .filter((item) => item.path && item.element)
    .map((item) => `/${item.overwritePath ? item.overwritePath : `${group.path}/${item.path}`}`.replace('//', '/')),
);

export const isNodeSubpage = (pathname: string) => subpagePaths.includes(pathname);
