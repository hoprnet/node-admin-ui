// a peer heard from within this window counts as online
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const ONLINE_GREEN = '#008a0d';

/**
 * Last-seen table cell: green 'Online' when the peer was heard from within the
 * last 5 minutes, otherwise the timestamp, 'Not seen' when never heard from and
 * '-' for the connected node itself.
 */
export const LastSeen = ({ timestamp, self }: { timestamp: number; self?: boolean }) => {
  if (self) return <span>-</span>;
  if (timestamp > 0 && Date.now() - timestamp < ONLINE_WINDOW_MS) {
    return <span style={{ color: ONLINE_GREEN, fontWeight: 600 }}>Online</span>;
  }
  const lastSeen =
    timestamp > 0
      ? new Date(timestamp)
          .toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          })
          .replace(', ', '\n')
      : 'Not seen';
  return <span style={{ whiteSpace: 'break-spaces' }}>{lastSeen}</span>;
};
