import { useState } from 'react';
import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';

const LogId = styled.span`
  cursor: pointer;
  font-weight: bold;
`;

const AbbrLogId = styled(LogId.withComponent('abbr'))`
  text-decoration: underline dotted;
`;

type AbbreviatedPeerAddressProps = {
  id: string;
};

const AbbreviatedPeerAddress = ({ id }: AbbreviatedPeerAddressProps) => {
  const [isExpanded, set_isExpanded] = useState(false);

  const handleClick = () => {
    set_isExpanded(!isExpanded);
  };

  if (isExpanded) {
    return <LogId onClick={handleClick}>{id}</LogId>;
  }

  return (
    <Tooltip title={id}>
      <AbbrLogId onClick={handleClick}>{id.slice(48)}</AbbrLogId>
    </Tooltip>
  );
};

export default AbbreviatedPeerAddress;
