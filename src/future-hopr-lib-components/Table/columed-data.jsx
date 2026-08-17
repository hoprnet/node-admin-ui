import React from 'react';
import styled from '@emotion/styled';

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
  font-family: 'Source Code Pro';
  width: 100%;
  font-size: 14px;
  border-bottom: 0.1rem solid darkgray;
  border-collapse: collapse;
  th {
    text-align: left;
    vertical-align: top;
  }
  tr {
    border-top: 0.1rem solid darkgray;
  }
  th,
  td {
    padding: 8px;
  }
  td {
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  th {
    overflow-wrap: break-word;
  }
  th:first-of-type {
    width: ${(props) => (props.width1stColumn ? props.width1stColumn : '160')}px;
  }
  &.table-has-title {
    tr:first-of-type {
      border-top: 0.2rem solid darkgray;
    }
  }
  ${(props) => props.noTopBorder && `tr:first-of-type { border-top: none; }`};

  @media screen and (max-width: 992px) {
    tr {
      display: flex;
      flex-direction: column;
    }
    th:first-of-type {
      padding-top: 12px;
      padding-bottom: 0px;
    }
    td {
      padding-top: 2px;
    }
  }
`;

const Content = styled.div`
  color: #414141;
  width: 100%;
  .title {
    color: #414141;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 700;
  }
`;

export function TableExtended(props) {
  return (
    <Content style={props.style}>
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
