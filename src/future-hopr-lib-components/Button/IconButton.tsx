import styled from '@emotion/styled';

// Mui
import { Tooltip, IconButton as MuiIconButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { v } from '../../theme';

type SubpageTitleProps = {
  reloading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  iconComponent?: any;
  tooltipText?: string | JSX.Element;
  className?: string;
  style?: Object;
  pending?: boolean;
};

const SIconButton = styled(MuiIconButton)`
  width: 30px;
  height: 30px;
  svg {
    width: 18px;
    height: 18px;
  }
  &.Mui-disabled svg {
    color: ${v.text3};
    fill: ${v.text3};
    opacity: 0.6;
  }
  &.reloading svg {
    animation: rotation 1s infinite linear;
  }
`;

const SCircularProgress = styled(CircularProgress)`
  position: absolute;
  &.pending,
  &.pending > svg {
    width: 18px !important;
    height: 18px !important;
    color: ${v.accent};
  }
`;

export const IconButton = ({
  reloading,
  tooltipText,
  className,
  style,
  onClick,
  iconComponent,
  disabled,
  pending,
}: SubpageTitleProps) => {
  return (
    <Tooltip
      title={tooltipText}
      className={className}
      style={style}
    >
      <span>
        <SIconButton
          disabled={disabled || pending || reloading}
          className={`${reloading ? 'reloading' : ''}`}
          onClick={onClick}
        >
          {iconComponent}
          {pending && <SCircularProgress className={'pending'} />}
        </SIconButton>
      </span>
    </Tooltip>
  );
};

export default IconButton;
