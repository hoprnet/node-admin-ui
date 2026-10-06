import { formatEther, parseEther } from 'viem';
import { useAppSelector } from '../store';
import { readSeries } from '../utils/prometheus';
import { formatAmount } from '../utils/format';

/*
 * Conditions of the connected node that need the operator's attention. They
 * are derived from data the app already polls, so they appear and disappear
 * on their own (unlike notifications, which are events).
 */

export type NodeAlert = {
  id: string;
  tone: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  action?: { label: string; to?: string; href?: string };
};

// thresholds
const XDAI_DANGER = parseEther('0.001');
const XDAI_WARNING = parseEther('0.05');
const ALLOWANCE_DANGER = parseEther('1');
const ALLOWANCE_WARNING = parseEther('100');

const big = (value: string | null | undefined) => {
  try {
    return value ? BigInt(value) : null;
  } catch (e) {
    return null;
  }
};

export const useNodeAlerts = (): NodeAlert[] => {
  const connected = useAppSelector((store) => store.auth.status.connected);
  const info = useAppSelector((store) => store.node.info.data);
  const isReady = useAppSelector((store) => store.node.nodeIsReady.data);
  const balances = useAppSelector((store) => store.node.balances.data);
  const balancesLoaded = useAppSelector((store) => store.node.balances.alreadyFetched);
  const rawMetrics = useAppSelector((store) => store.node.metrics.data.raw);
  const outgoing = useAppSelector((store) => store.node.channels.data?.outgoing);

  if (!connected) return [];
  const alerts: NodeAlert[] = [];

  if (isReady === false) {
    alerts.push({
      id: 'not-ready',
      tone: 'danger',
      title: 'Node is not ready',
      description: 'The node is running but not ready to relay yet. It may still be starting or syncing.',
    });
  }

  switch (info?.connectivityStatus) {
    case 'Red':
      alerts.push({
        id: 'connectivity',
        tone: 'danger',
        title: 'No network connectivity',
        description: 'The node has no usable connection to the network and cannot relay packets.',
        action: { label: 'View peers', to: '/networking/peers' },
      });
      break;
    case 'Orange':
    case 'Yellow':
      alerts.push({
        id: 'connectivity',
        tone: 'warning',
        title: `Connectivity is ${info.connectivityStatus.toLowerCase()}`,
        description: 'The connection quality to the network is low. Check reachability and peers.',
        action: { label: 'View health', to: '/node/health' },
      });
      break;
  }

  const xdai = big(balances.native.value);
  if (balancesLoaded && xdai !== null && xdai < XDAI_WARNING) {
    alerts.push({
      id: 'xdai',
      tone: xdai < XDAI_DANGER ? 'danger' : 'warning',
      title: 'Low xDAI on the node',
      description: `The node holds ${formatAmount(
        balances.native.formatted,
      )} xDAI to pay for on-chain transactions (channels, redemptions). Top it up soon.`,
    });
  }

  const allowance = big(balances.safeHoprAllowance.value);
  if (balancesLoaded && allowance !== null && allowance < ALLOWANCE_WARNING) {
    alerts.push({
      id: 'allowance',
      tone: allowance < ALLOWANCE_DANGER ? 'danger' : 'warning',
      title: 'Low wxHOPR allowance',
      description: `The node may only spend ${formatAmount(
        balances.safeHoprAllowance.formatted,
      )} wxHOPR from the safe. Opening and funding channels draws from this allowance.`,
      action: { label: 'Open Staking Hub', href: 'https://hub.hoprnet.org' },
    });
  }

  const required = readSeries(rawMetrics, 'hopr_strategy_channel_lifecycle_required_safe_balance_hopr');
  const safeHopr = balances.safeHopr.value ? Number(formatEther(BigInt(balances.safeHopr.value))) : null;
  if (required && safeHopr !== null && safeHopr < required) {
    alerts.push({
      id: 'safe-balance',
      tone: 'danger',
      title: 'Safe balance below strategy needs',
      description: `The channel strategy needs ${formatAmount(required)} wxHOPR in the safe, it holds ${formatAmount(
        safeHopr,
      )}. Channels will not be opened or funded.`,
      action: { label: 'Open Staking Hub', href: 'https://hub.hoprnet.org' },
    });
  }

  const pending = (outgoing ?? []).filter((channel) => channel.status === 'PendingToClose').length;
  if (pending > 0) {
    alerts.push({
      id: 'pending-close',
      tone: 'info',
      title: `${pending} outgoing channel${pending > 1 ? 's' : ''} pending to close`,
      description: 'Once the notice period has elapsed, finalize the closure to return the funds to the safe.',
      action: { label: 'View channels', to: '/networking/channels?direction=out' },
    });
  }

  const order = { danger: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.tone] - order[b.tone]);
};
