import styled from '@emotion/styled';
import { v } from '../../../theme';

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  background-color: ${v.surface2};
  border: 1px solid ${v.border};
  border-radius: 6px;
  color: ${v.text};

  &:disabled {
    pointer-events: none;
    code {
      color: ${v.text3};
      user-select: none;
    }
  }
  code {
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 20px;
    cursor: pointer;
    align-self: center;
    white-space: normal;
    overflow-wrap: anywhere;
    padding: 10px 0 10px 12px;
    width: 100%;
    color: ${v.text};
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin: 4px;
    padding: 6px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: ${v.text3};
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
    &:hover {
      background: ${v.surface3};
      color: ${v.text};
    }
  }
  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;
