import styled from '@emotion/styled';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { v } from '../../theme';

export const SDialog = styled(({ maxWidth, ...rest }: any) => <Dialog {...rest} />)`
  .MuiPaper-root {
    width: 100%;
    ${(props) =>
      props.maxWidth &&
      `
      max-width: ${props.maxWidth};
    `}
  }
`;

export const TopBar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  .MuiDialogTitle-root {
    padding-bottom: 12px;
  }
`;

export const SDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
  font-size: 13.5px;
  color: ${v.text2};
  &.error-message {
    white-space: break-spaces;
    line-height: 1.7;
  }
  .MuiFormControl-root,
  .MuiAutocomplete-root {
    margin-top: 6px;
  }
`;

export const SIconButton = styled(IconButton)`
  height: 32px;
  width: 32px;
  margin: 14px 14px 0 0;
`;
