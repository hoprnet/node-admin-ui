import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';

// Mui
import RefreshIcon from '@mui/icons-material/Refresh';
import { Tooltip, IconButton } from '@mui/material';
import { v } from '../../theme';

type SubpageTitleProps = {
  title?: string;
  count?: number | string | null;
  description?: ReactNode;
  reloading?: boolean;
  refreshFunction?: () => void;
  actions?: any;
};

const Content = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 36px;
  flex-wrap: wrap;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  h2 {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    letter-spacing: -0.015em;
    color: ${v.text};
  }
  .count {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
    color: ${v.text3};
  }
  .description {
    font-size: 13px;
    color: ${v.text2};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  .actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .actions .MuiIconButton-root,
  .refresh {
    width: 32px;
    height: 32px;
    border: 1px solid ${v.border};
    background: ${v.surface};
    &:hover {
      border-color: ${v.borderStrong};
    }
    &.Mui-disabled {
      background: transparent;
    }
  }
  .reloading svg {
    animation: rotation 1s infinite linear;
  }
`;

export const SubpageTitle = ({ title, count, description, reloading, refreshFunction, actions }: SubpageTitleProps) => {
  const [reloadingLocal, set_reloadingLocal] = useState(false);

  return (
    <Content>
      <Heading>
        <h2>
          {title}
          {count !== undefined && <span className="count">{count ?? '–'}</span>}
        </h2>
        {description && <div className="description">{description}</div>}
      </Heading>
      <Toolbar>
        {actions && <div className="actions">{actions}</div>}
        {refreshFunction && (
          <Tooltip title="Refresh">
            <IconButton
              aria-label="Refresh"
              className={`refresh ${reloading || reloadingLocal ? 'reloading' : ''}`}
              onClick={() => {
                set_reloadingLocal(true);
                refreshFunction();
                setTimeout(() => {
                  set_reloadingLocal(false);
                }, 1000);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </Content>
  );
};
