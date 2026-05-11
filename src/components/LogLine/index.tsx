import styled from '@emotion/styled';
import type { Log } from '../../types';
import AbbreviatedPeerAddress from '../AbbreviatedPeerAddress';
import JazzIcon from '../../future-hopr-lib-components/Icons/JazzIcon';
import { Tooltip } from '@mui/material';

const LogLineContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  width: 100%;

  @media (min-width: 840px) {
    gap: 3rem;
  }
`;

const StyledTime = styled.time`
  align-self: flex-start;
  display: block;
  font-size: 0.75rem;
  opacity: 0.3;
  text-align: right;
`;

const Pre = styled.pre`
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding-bottom: 0.5rem;
  white-space: break-spaces;
  word-break: break-all;
`;

const regex = /(\b\w{53})\b/g;

type TimeProps = {
  timestamp: number;
};

const Time = ({ timestamp }: TimeProps) => {
  const formattedDate = new Date(timestamp).toString();
  const formattedTime = new Date(timestamp).toISOString().slice(11);

  return (
    <Tooltip title={formattedDate}>
      <StyledTime>{formattedTime}</StyledTime>
    </Tooltip>
  );
};

type LogLineProps = {
  log: Log;
};

const LogLine = ({ log }: LogLineProps) => {
  const peerAddress = log.message.match(regex)?.[0];

  return (
    <LogLineContainer>
      <Pre>
        {peerAddress ? (
          <>
            <JazzIcon
              address={peerAddress}
              diameter={16}
            />
            <div>
              {log.message.replace(peerAddress, '')}
              <AbbreviatedPeerAddress id={peerAddress} />
            </div>
          </>
        ) : (
          log.message
        )}
      </Pre>
      <Time timestamp={log.timestamp} />
    </LogLineContainer>
  );
};

export default LogLine;
