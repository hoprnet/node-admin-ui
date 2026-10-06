import { ReactNode, useState } from 'react';
import { useAppSelector, useReadOnly } from '../../store';
import { useCloseChannel } from '../../hooks/useCloseChannel';
import { Address, Amount } from '../Data';
import { HOPR_TOKEN_USED } from '../../../config';
import ConfirmDialog from '../Modal/ConfirmDialog';

// Modals, used in controlled mode (no trigger of their own)
import { PingModal } from '../Modal/node/PingModal';
import { CreateAliasModal } from '../Modal/node/AddAliasModal';
import { OpenChannelModal } from '../Modal/node/OpenChannelModal';
import { FundChannelModal } from '../Modal/node/FundChannelModal';
import { OpenSessionModal } from '../Modal/node/OpenSessionModal';

// Icons
import PingIcon from '@mui/icons-material/NetworkPing';
import AliasIcon from '@mui/icons-material/BadgeOutlined';
import OpenChannelIcon from '@mui/icons-material/AddLink';
import FundIcon from '@mui/icons-material/AddCard';
import CloseIcon from '@mui/icons-material/LinkOff';
import SessionIcon from '@mui/icons-material/CableOutlined';

export type PeerAction = {
  key: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  run: () => void;
};

type Dialog = 'ping' | 'alias' | 'openChannel' | 'fundChannel' | 'session' | 'closeOutgoing' | 'closeIncoming' | null;

/** Channels the node has with a peer, in both directions. */
export const usePeerChannels = (address: string | null | undefined) => {
  const outgoingId = useAppSelector((store) =>
    address ? store.node.links.peerAddressToOutgoingChannel[address] : null,
  );
  const incomingId = useAppSelector((store) =>
    address ? store.node.links.peerAddressToIncomingChannel[address] : null,
  );
  const outgoing = useAppSelector((store) => (outgoingId ? store.node.channels.parsed.outgoing[outgoingId] : null));
  const incoming = useAppSelector((store) => (incomingId ? store.node.channels.parsed.incoming[incomingId] : null));
  return {
    outgoing: outgoing && outgoing.status !== 'Closed' ? { id: outgoingId as string, ...outgoing } : null,
    incoming: incoming && incoming.status !== 'Closed' ? { id: incomingId as string, ...incoming } : null,
  };
};

/**
 * Every action available on a peer (ping, alias, channels, session), shared by
 * the row menus and the detail panel. Actions that change the node are left out
 * in read-only mode. Render `dialogs` once next to whatever lists the actions.
 */
export const usePeerActions = (address: string | null | undefined) => {
  const readOnly = useReadOnly();
  const closeChannel = useCloseChannel();
  const { outgoing, incoming } = usePeerChannels(address);
  const [dialog, set_dialog] = useState<Dialog>(null);
  const [closing, set_closing] = useState(false);
  const close = () => set_dialog(null);

  if (!address) return { actions: [] as PeerAction[], dialogs: null };

  const actions: PeerAction[] = [{ key: 'ping', label: 'Ping', icon: <PingIcon />, run: () => set_dialog('ping') }];
  // aliases are stored in this browser, not on the node
  actions.push({ key: 'alias', label: 'Set alias', icon: <AliasIcon />, run: () => set_dialog('alias') });
  if (!readOnly) {
    if (!outgoing) {
      actions.push({
        key: 'openChannel',
        label: 'Open channel',
        icon: <OpenChannelIcon />,
        run: () => set_dialog('openChannel'),
      });
    }
    if (outgoing?.status === 'Open') {
      actions.push({ key: 'fund', label: 'Fund channel', icon: <FundIcon />, run: () => set_dialog('fundChannel') });
    }
    actions.push({ key: 'session', label: 'Open session', icon: <SessionIcon />, run: () => set_dialog('session') });
    if (outgoing) {
      actions.push({
        key: 'closeOutgoing',
        label: outgoing.status === 'PendingToClose' ? 'Finalize outgoing closure' : 'Close outgoing channel',
        icon: <CloseIcon />,
        danger: true,
        run: () => set_dialog('closeOutgoing'),
      });
    }
    if (incoming?.status === 'Open') {
      actions.push({
        key: 'closeIncoming',
        label: 'Close incoming channel',
        icon: <CloseIcon />,
        danger: true,
        run: () => set_dialog('closeIncoming'),
      });
    }
  }

  const confirmClose = (direction: 'outgoing' | 'incoming') => {
    set_closing(true);
    // the close itself takes minutes on-chain; progress shows on the channel row
    closeChannel(direction, address).finally(() => set_closing(false));
    close();
  };

  const dialogs = (
    <>
      <PingModal
        address={address}
        hideTrigger
        open={dialog === 'ping'}
        onClose={close}
      />
      <CreateAliasModal
        address={address}
        hideTrigger
        open={dialog === 'alias'}
        onClose={close}
      />
      <OpenChannelModal
        peerAddress={address}
        hideTrigger
        open={dialog === 'openChannel'}
        onClose={close}
      />
      <FundChannelModal
        address={address}
        hideTrigger
        open={dialog === 'fundChannel'}
        onClose={close}
      />
      <OpenSessionModal
        destination={address}
        hideTrigger
        open={dialog === 'session'}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog === 'closeOutgoing'}
        title={outgoing?.status === 'PendingToClose' ? 'Finalize channel closure' : 'Close outgoing channel'}
        description={
          outgoing?.status === 'PendingToClose'
            ? 'Finalizes the closure once the notice period has elapsed. The channel funds return to your safe.'
            : 'Starts closing the channel. After the notice period you finalize the closure, then the funds return to your safe. Relaying through this peer stops.'
        }
        summary={[
          {
            label: 'To',
            value: (
              <Address
                address={address}
                tools={false}
              />
            ),
          },
          { label: 'Status', value: outgoing?.status ?? '-' },
          {
            label: 'Funds',
            value: (
              <Amount
                value={outgoing?.balance}
                unit={HOPR_TOKEN_USED}
              />
            ),
          },
        ]}
        confirmLabel={outgoing?.status === 'PendingToClose' ? 'Finalize closure' : 'Close channel'}
        danger
        pending={closing}
        onConfirm={() => confirmClose('outgoing')}
        onClose={close}
      />
      <ConfirmDialog
        open={dialog === 'closeIncoming'}
        title="Close incoming channel"
        description="Closes the channel this peer opened to you. Redeem its tickets first: unredeemed tickets are lost."
        summary={[
          {
            label: 'From',
            value: (
              <Address
                address={address}
                tools={false}
              />
            ),
          },
          {
            label: 'Funds',
            value: (
              <Amount
                value={incoming?.balance}
                unit={HOPR_TOKEN_USED}
              />
            ),
          },
        ]}
        confirmLabel="Close channel"
        danger
        pending={closing}
        onConfirm={() => confirmClose('incoming')}
        onClose={close}
      />
    </>
  );

  return { actions, dialogs };
};
