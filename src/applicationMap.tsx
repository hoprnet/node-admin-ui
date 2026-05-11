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

// Icons
import InfoIcon from '@mui/icons-material/Info';
import LanIcon from '@mui/icons-material/Lan';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SettingsIcon from '@mui/icons-material/Settings';
import ContactPhone from '@mui/icons-material/ContactPhone';
import SavingsIcon from '@mui/icons-material/Savings';
import NodeIcon from '@mui/icons-material/Router';
import NetworkingIcon from '@mui/icons-material/Diversity3';
import DevelopIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TelegramIcon from '@mui/icons-material/Telegram';
import IncomingChannelsIcon from './future-hopr-lib-components/Icons/channelsIn';
import OutgoingChannelsIcon from './future-hopr-lib-components/Icons/channelsOut';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';

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
    groupName: 'NODE',
    path: 'node',
    icon: <NodeIcon />,
    items: [
      {
        name: 'INFO',
        path: 'info',
        icon: <InfoIcon />,
        element: <InfoPage />,
        loginNeeded: 'node',
      },
      {
        name: 'TICKETS',
        path: 'tickets',
        icon: <ConfirmationNumberIcon />,
        element: <TicketsPage />,
        loginNeeded: 'node',
      },
      {
        name: 'CONFIGURATION',
        path: 'configuration',
        icon: <SettingsIcon />,
        element: <ConfigurationPage />,
        loginNeeded: 'node',
      },
    ],
  },
  {
    groupName: 'NETWORKING',
    path: 'networking',
    icon: <NetworkingIcon />,
    items: [
      {
        name: 'PEERS',
        path: 'peers',
        icon: <LanIcon />,
        element: <PeersPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfPeers',
        fetchingKey: 'fetchingPeers',
      },
      {
        name: 'ALIASES',
        path: 'aliases',
        icon: <ContactPhone />,
        element: <AliasesPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfAliases',
      },
      {
        name: 'CHANNELS: IN',
        path: 'channels-INCOMING',
        icon: <IncomingChannelsIcon />,
        element: <ChannelsPageIncoming />,
        loginNeeded: 'node',
        numberKey: 'numberOfChannelsIn',
        fetchingKey: 'fetchingChannels',
      },
      {
        name: 'CHANNELS: OUT',
        path: 'channels-OUTGOING',
        icon: <OutgoingChannelsIcon />,
        element: <ChannelsPageOutgoing />,
        loginNeeded: 'node',
        numberKey: 'numberOfChannelsOut',
        fetchingKey: 'fetchingChannels',
      },
      {
        name: 'SESSIONS',
        path: 'sessions',
        icon: <SettingsPhoneIcon />,
        element: <SessionsPage />,
        loginNeeded: 'node',
        numberKey: 'numberOfSessions',
        fetchingKey: 'fetchingSessions',
      },
    ],
  },
  {
    groupName: 'LINKS',
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
        icon: <LibraryBooksIcon />,
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
    groupName: 'DEVELOP / Steps',
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
