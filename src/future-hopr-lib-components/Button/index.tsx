import { forwardRef, Ref } from 'react';
import styled from '@emotion/styled';
import MuiButton, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { v } from '../../theme';

type StyledButtonProps = ButtonProps & {
  imageOnly?: boolean;
  size70?: boolean;
  standardWidth?: boolean;
  fade?: boolean;
  pending?: boolean;
  nofade?: boolean;
  outlined?: boolean;
  target?: string;
};

// Legacy variant props (fade, nofade, size70, ...) are kept for compatibility
// and mapped onto the neutral button styles of the theme.
const StyledButton = styled(MuiButton)<StyledButtonProps>`
  text-align: center;
  white-space: nowrap;
  p {
    margin: 0;
  }

  &.btn-hopr--v2:not(.Mui-disabled):not(.btn-hopr--outlined) {
    background: ${v.accent};
    color: ${v.accentContrast};
    &:hover {
      background: ${v.accentHover};
    }
  }
  &.Mui-disabled {
    background: ${v.surface3};
    color: ${v.text3};
  }
  &.btn-hopr--standardWidth {
    width: 100%;
    max-width: 222px;
  }
  &.btn-hopr--size70 {
    min-height: 44px;
    font-size: 14.5px;
    font-weight: 600;
  }
  &.btn-hopr--image-only {
    padding: 8px;
    width: 56px;
    height: 56px;
    img {
      width: 100%;
      max-width: 40px;
    }
  }
  &.btn-hopr--v2.btn-hopr--fade:not(.Mui-disabled) {
    opacity: 0.7;
  }
  &.btn-hopr--no-fade {
    align-self: flex-start;
    font-size: 12.5px;
    min-height: 28px;
    padding: 3px 10px;
  }
  &.btn-hopr--outlined:not(.Mui-disabled) {
    background: ${v.surface};
    color: ${v.text};
    border: 1px solid ${v.borderStrong};
    &:hover {
      background: ${v.surface2};
    }
  }
`;

const SCircularProgress = styled(CircularProgress)`
  width: 18px !important;
  height: 18px !important;
  position: absolute;
  color: ${v.accent};
`;

const Button = forwardRef((props: StyledButtonProps, ref: Ref<HTMLButtonElement>) => {
  const { imageOnly, size70, standardWidth, fade, children, nofade, pending, outlined, ...rest } = props;

  const classNames = [
    props.className,
    'btn-hopr--v2',
    imageOnly && 'btn-hopr--image-only',
    size70 && 'btn-hopr--size70',
    standardWidth && 'btn-hopr--standardWidth',
    fade && 'btn-hopr--fade',
    nofade && 'btn-hopr--no-fade',
    outlined && 'btn-hopr--outlined',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <StyledButton
      variant="contained"
      {...rest}
      ref={ref}
      className={classNames}
      disabled={props.disabled || pending}
    >
      {children}
      {pending && <SCircularProgress />}
    </StyledButton>
  );
});

Button.displayName = 'Button'; // Set the display name here

export default Button;
