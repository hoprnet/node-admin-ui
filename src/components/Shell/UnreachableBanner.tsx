import styled from '@emotion/styled';
import WarningIcon from '@mui/icons-material/ErrorOutline';
import { useAppSelector } from '../../store';
import { useRefreshAll } from '../../hooks/useRefreshAll';
import { formatAgo } from '../../utils/format';
import { v } from '../../theme';

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 32px;
  background: ${v.dangerSoft};
  border-bottom: 1px solid ${v.border};
  color: ${v.danger};
  font-size: 13px;
  svg {
    width: 18px;
    height: 18px;
  }
  span {
    color: ${v.text};
  }
  button {
    margin-left: auto;
    height: 28px;
    padding: 0 10px;
    border: 1px solid ${v.borderStrong};
    border-radius: 6px;
    background: ${v.surface};
    color: ${v.text};
    font-size: 12.5px;
    cursor: pointer;
    &:hover {
      background: ${v.surface2};
    }
  }
  @media (max-width: 700px) {
    padding: 10px 16px;
  }
`;

/** Shown when the node stopped answering: the data below is stale. */
export default function UnreachableBanner() {
  const connected = useAppSelector((store) => store.auth.status.connected);
  const { consecutiveErrors, lastSuccessAt } = useAppSelector((store) => store.ui.sync);
  const { refresh, isFetching } = useRefreshAll();
  if (!connected || consecutiveErrors < 3) return null;
  return (
    <Banner role="alert">
      <WarningIcon />
      <span>The node is not responding. The data below is from {formatAgo(lastSuccessAt)} and may be out of date.</span>
      <button
        onClick={refresh}
        disabled={isFetching}
      >
        {isFetching ? 'Retrying…' : 'Retry'}
      </button>
    </Banner>
  );
}
