import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '../../future-hopr-lib-components/Button';
import { v } from '../../theme';

const Summary = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  margin: 12px 0 0;
  padding: 12px 14px;
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface2};
  font-size: 13px;
  dt {
    color: ${v.text2};
  }
  dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    text-align: right;
  }
`;

const DangerButton = styled(Button)`
  &.btn-hopr--v2:not(.Mui-disabled):not(.btn-hopr--outlined) {
    background: ${v.danger};
    color: #fff;
    &:hover {
      background: ${v.danger};
      filter: brightness(0.92);
    }
  }
`;

/** Confirmation of an action that changes the node, with a summary of what will happen. */
export default function ConfirmDialog({
  open,
  title,
  description,
  summary,
  confirmLabel,
  danger,
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  summary?: { label: string; value: ReactNode }[];
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const Confirm = danger ? DangerButton : Button;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ fontSize: 13.5, color: 'text.secondary' }}>
        {description}
        {summary && (
          <Summary>
            {summary.map((row) => (
              <div
                key={row.label}
                style={{ display: 'contents' }}
              >
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </Summary>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          outlined
          onClick={onClose}
        >
          Cancel
        </Button>
        <Confirm
          onClick={onConfirm}
          pending={pending}
        >
          {confirmLabel}
        </Confirm>
      </DialogActions>
    </Dialog>
  );
}
