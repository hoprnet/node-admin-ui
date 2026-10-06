import React from 'react';
import styled from '@emotion/styled';
import { v } from '../../theme';

export const Tables = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  .mobile-only {
    display: none;
  }
  @media only screen and (max-width: 820px) {
    flex-direction: column;
    gap: 0px;
    .not-on-mobile {
      display: none;
    }
    .mobile-only {
      display: table;
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
  color: ${v.text};
  th {
    text-align: left;
    vertical-align: top;
    font-weight: 400;
    color: ${v.text2};
    overflow-wrap: break-word;
  }
  tr + tr {
    border-top: 1px solid ${v.border};
  }
  th,
  td {
    padding: 9px 16px;
    line-height: 20px;
  }
  td {
    overflow: hidden;
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
  td:has(input, button, textarea, .MuiSwitch-root) {
    font-family: var(--font-sans);
    font-size: 13.5px;
    letter-spacing: 0;
    color: ${v.text};
  }
  th:first-of-type {
    width: ${(props) => (props.width1stColumn ? props.width1stColumn : '180')}px;
  }

  @media screen and (max-width: 640px) {
    tr {
      display: flex;
      flex-direction: column;
    }
    th:first-of-type {
      width: auto;
      padding-bottom: 0;
    }
    td {
      padding-top: 2px;
    }
  }
`;

// Vertical stack of TableExtended cards.
export const CardStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Content = styled.section`
  width: 100%;
  box-sizing: border-box;
  background: ${v.surface};
  border: 1px solid ${v.border};
  border-radius: 8px;
  overflow: hidden;
  break-inside: avoid;
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid ${v.border};
    font-size: 13.5px;
    font-weight: 600;
    color: ${v.text};
  }
`;

export function TableExtended(props) {
  return (
    <Content
      className="TableExtended"
      style={props.style}
    >
      {props.title && <div className="title">{props.title}</div>}
      <Table
        className="table-has-title"
        width1stColumn={props.width1stColumn}
      >
        {props.children}
      </Table>
    </Content>
  );
}

// elemet should accept only <tbody>
export default function TableDataColumed(props) {
  return (
    <Tables className={['columned-data'].join(' ')}>
      {props.children.length > 0 ? (
        props.children?.map((elem, key) => {
          return (
            <Table
              className="not-on-mobile"
              width1stColumn={props.width1stColumn}
              key={key}
            >
              {elem}
            </Table>
          );
        })
      ) : (
        <Table>{props.children}</Table>
      )}
      <Table className="mobile-only">{props.children.length > 0 && props.children?.map((elem) => elem)}</Table>
    </Tables>
  );
}
