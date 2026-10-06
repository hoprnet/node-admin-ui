import * as React from 'react';
import styled from '@emotion/styled';

import Dialog, { DialogProps } from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';

import { Row } from '../Atoms/row';

import CloseIcon from '@mui/icons-material/Close';

const SDialog = styled(({ maxWidthCss, ...rest }: PropsStyled) => <Dialog {...rest} />)`
  .MuiPaper-root {
    max-width: ${(props) => (props.maxWidthCss ? props.maxWidthCss : '420px')};
    width: 100%;
    padding: 16px 20px 20px;
    font-size: 13.5px;
    line-height: 1.6;
    .modal-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
`;

interface PropsStyled extends Omit<DialogProps, 'maxWidth'> {
  selectedValue?: any;
  maxWidthCss?: string;
}

const Content = styled.div``;

interface Props extends Omit<DialogProps, 'maxWidth'> {
  selectedValue?: any;
  maxWidth?: string;
}

const Modal: React.FC<Props> = (props) => {
  const { onClose, selectedValue, open, title, children, maxWidth, disableScrollLock } = props;

  const handleClose = (event: {}) => {
    // @ts-expect-error
    onClose(event, 'escapeKeyDown');
  };

  return (
    <SDialog
      onClose={handleClose}
      open={open}
      maxWidthCss={maxWidth}
      disableScrollLock={disableScrollLock}
    >
      <Row>
        <div className="modal-title">{title}</div>
        <IconButton
          aria-label="close modal"
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </Row>
      <Content>{children}</Content>
    </SDialog>
  );
};

export default Modal;
