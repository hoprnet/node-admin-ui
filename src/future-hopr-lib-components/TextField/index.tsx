import MuiTextField, { TextFieldProps } from '@mui/material/TextField';
import styled from '@emotion/styled';
import { v } from '../../theme';

const STextField = styled(MuiTextField)`
  width: 100%;
  margin-bottom: 8px;
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input {
    -moz-appearance: textfield;
  }
  .MuiFormLabel-root.MuiInputLabel-shrink {
    color: ${v.text2};
  }
  .MuiFormLabel-root.MuiInputLabel-shrink.Mui-focused {
    color: ${v.accentText};
  }
  @media (max-width: 320px) {
    .MuiInputAdornment-root {
      display: none;
    }
  }
`;

const TextField: React.FC<TextFieldProps> = (props) => {
  return (
    <STextField
      {...props}
      variant="outlined"
    />
  );
};

export default TextField;
