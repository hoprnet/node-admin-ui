import styled from '@emotion/styled';
import MuiButton, { ButtonProps } from '@mui/material/Button';
import { v } from '../../theme';

// Secondary (outlined) button.
const SButton = styled(MuiButton)`
  background: ${v.surface};
  color: ${v.text};
  border: 1px solid ${v.borderStrong};
  text-align: center;

  &.unifiedSize {
    width: 100%;
    max-width: 222px;
  }

  &:hover {
    background-color: ${v.surface2};
    color: ${v.text};
  }
`;

export default function Button(props: ButtonProps) {
  return (
    <SButton
      className={props.className}
      {...props}
    >
      {props.children}
    </SButton>
  );
}
