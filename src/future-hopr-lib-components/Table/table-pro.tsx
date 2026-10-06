import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import _debounce from 'lodash/debounce';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

// HOPR
import Tooltip from '../../future-hopr-lib-components/Tooltip/tooltip-fixed-width';
import { navBarHeight } from '../Navbar/navBar';

// Mui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { v } from '../../theme';

const STable = styled(Table)`
  tr.onRowClick {
    cursor: pointer;
  }
  thead th {
    border-bottom: 1px solid ${v.border};
  }
`;

/*
 * overflow-x: unset keeps the window as the scroll container so the sticky
 * table header can stick below the navbar; on narrow screens horizontal
 * scrolling wins over stickiness.
 */
const STableContainer = styled(TableContainer)`
  overflow-x: unset;
  border: 1px solid ${v.border};
  border-radius: 8px;
  background: ${v.surface};
  @media (max-width: 850px) {
    overflow-x: auto;
  }

  /*
   * In window-scroll mode virtuoso sets an inline pixel height on its scroller
   * from summed row measurements; fractional row heights (browser zoom, OS
   * scaling) make that drift from the table's real layout height and cut off
   * the last row. height: auto keeps the scroll range equal to the actual
   * rendered table height.
   */
  div[data-virtuoso-scroller] {
    height: auto !important;
  }
` as typeof TableContainer;

const STableCell = styled(TableCell)`
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 168px);
  &.actions {
    overflow: unset;
    padding-top: 4px;
    padding-bottom: 4px;
  }
  &.wrap {
    overflow-wrap: anywhere;
    text-overflow: unset;
    white-space: unset;
  }
  /* row index */
  &.id {
    min-width: 40px;
    text-overflow: clip;
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${v.text3};
  }
  &.TableCellHeader.id {
    font-family: inherit;
  }
  /* node / address cells */
  &:has(.node-jazz-icon) {
    font-family: var(--font-mono);
    font-size: 12.5px;
    letter-spacing: -0.01em;
  }
`;

const OverTable = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid ${v.border};
`;

const SearchInput = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  width: 100%;
  max-width: 340px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid ${v.border};
  border-radius: 6px;
  background: ${v.surface2};
  color: ${v.text3};
  transition: border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
  &:focus-within {
    border-color: ${v.accent};
    background: ${v.surface};
    box-shadow: 0 0 0 3px ${v.focus};
  }
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  input {
    flex-grow: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 13px;
    color: ${v.text};
    &::placeholder {
      color: ${v.text3};
    }
  }
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: ${v.text3};
`;

interface Props {
  data: {
    [key: string]: string | number | JSX.Element;
    id: string | number;
    actions: JSX.Element;
  }[];
  id?: string;
  header: {
    key: string;
    name: string;
    search?: boolean;
    tooltip?: boolean;
    width?: string;
    wrap?: boolean;
    maxWidth?: string;
    copy?: boolean;
    hidden?: boolean;
    tooltipHeader?: string | JSX.Element;
  }[];
  search?: boolean;
  loading?: boolean;
  onRowClick?: Function;
  orderByDefault?: string;
}

type RowData = Props['data'][0];

type TableContext = {
  tableId?: string;
  header: Props['header'];
  onRowClick?: Function;
};

type Order = 'asc' | 'desc';

const isString = (value: any) => typeof value === 'string' || value instanceof String;

function descendingComparator<T>(
  a: { [key in string]: number | string },
  b: { [key in string]: number | string },
  orderBy: string,
) {
  if (isString(b[orderBy]) && isString(a[orderBy])) {
    if ((b[orderBy] as string).toLowerCase() < (a[orderBy] as string).toLowerCase()) {
      return -1;
    }
    if ((b[orderBy] as string).toLowerCase() > (a[orderBy] as string).toLowerCase()) {
      return 1;
    }
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: string,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const virtuosoComponents: TableComponents<RowData, TableContext> = {
  Table: ({ context, ...tableProps }) => (
    <STable
      {...tableProps}
      aria-label="custom table"
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>(function VirtuosoTableHead(
    { context, ...headProps }: { context?: TableContext; style?: React.CSSProperties },
    ref,
  ) {
    return (
      <thead
        {...headProps}
        style={{
          ...headProps.style,
          top: navBarHeight,
          zIndex: 2,
        }}
        ref={ref}
      />
    );
  }),
  TableRow: ({ item, context, ...rowProps }) => (
    <TableRow
      {...rowProps}
      id={context?.tableId ? `${context.tableId}_row_${item.id}` : undefined}
      onClick={() => {
        context?.onRowClick && context.onRowClick(item);
      }}
      className={`${context?.onRowClick ? 'onRowClick' : ''}`}
    />
  ),
  TableBody: React.forwardRef<HTMLTableSectionElement>(function VirtuosoTableBody(props, ref) {
    return (
      <TableBody
        {...props}
        ref={ref}
      />
    );
  }),
};

export default function CustomPaginationActionsTable(props: Props) {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(props.orderByDefault || props.header[0].key || 'id');
  const [searchPhrase, set_searchPhrase] = React.useState('');
  const [filteredData, set_filteredData] = React.useState<typeof props.data>([]);

  useEffect(() => {
    filterData(searchPhrase);
  }, [props.data]);

  const debounceFn = useCallback(_debounce(filterData, 150), [props.data]);

  function handleSearchChange(event: { target: { value: string } }) {
    const search: string = event.target.value;
    set_searchPhrase(search);
    debounceFn(search);
  }

  function filterData(searchPhrase: string) {
    const data = props.data;
    const filterBy = props.header.filter((elem) => elem.search === true).map((header) => header.key);

    // SearchPhrase filter
    if (!searchPhrase || searchPhrase === '') {
      set_filteredData(data);
      return;
    }
    const filtered = data.filter((elem) => {
      for (let i = 0; i < filterBy.length; i++) {
        if (
          typeof elem[filterBy[i]] === 'string' &&
          (elem[filterBy[i]] as string).toLowerCase().includes(searchPhrase.toLowerCase())
        )
          return true;
      }
    });
    set_filteredData(filtered);
    return;
  }

  const sortedRows = React.useMemo(
    () =>
      [...filteredData]
        //@ts-expect-error as we can input JSX into the data, but we will not sort by it
        .sort(getComparator(order, orderBy)),
    [filteredData, order, orderBy],
  );

  return (
    <STableContainer component={Paper}>
      {props.search && (
        <OverTable className={`OverTable`}>
          <SearchInput>
            <SearchIcon />
            <input
              type="search"
              placeholder="Search"
              aria-label="Search table"
              value={searchPhrase}
              onChange={handleSearchChange}
            />
          </SearchInput>
        </OverTable>
      )}
      <TableVirtuoso
        useWindowScroll
        data={sortedRows}
        overscan={{ main: 1200, reverse: 1200 }}
        increaseViewportBy={{ top: 600, bottom: 600 }}
        computeItemKey={(_index, row) => `${props.id}_row_${row.id}`}
        context={{
          tableId: props.id,
          header: props.header,
          onRowClick: props.onRowClick,
        }}
        components={virtuosoComponents}
        fixedHeaderContent={() => (
          <TableRow>
            {props.header.map(
              (headElem, idx) =>
                !headElem.hidden && (
                  <STableCell
                    key={idx}
                    className={`TableCell TableCellHeader ${headElem.key}`}
                    width={headElem?.width ?? ''}
                  >
                    <Tooltip
                      title={headElem.tooltipHeader}
                      notWide
                    >
                      <span>{headElem.name}</span>
                    </Tooltip>
                  </STableCell>
                ),
            )}
          </TableRow>
        )}
        itemContent={(_index, row) => (
          <RowCells
            row={row}
            header={props.header}
          />
        )}
      />
      {sortedRows.length === 0 && (
        <EmptyState>
          {props.loading ? (
            <>
              <CircularProgress size={14} />
              Loading
            </>
          ) : searchPhrase ? (
            'No matching entries'
          ) : (
            'No entries'
          )}
        </EmptyState>
      )}
    </STableContainer>
  );
}

const RowCells = ({ row, header }: { row: RowData; header: Props['header'] }) => {
  const [tooltip, set_tooltip] = useState<string>();

  const onDoubleClick = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, value: string) => {
    // if row is clicked twice
    if (event.detail === 2) {
      navigator.clipboard.writeText(value);
      set_tooltip('Copied');
      setTimeout(() => {
        set_tooltip(undefined);
      }, 3000);
    }
  };

  return (
    <>
      {header.map(
        (headElem) =>
          !headElem.hidden && (
            <STableCell
              key={headElem.key}
              className={`TableCell ${headElem.key} ${headElem.wrap ? 'wrap' : ''}`}
              width={headElem.width}
              style={{ maxWidth: headElem.maxWidth }}
              onClick={(event) =>
                headElem.copy && typeof row[headElem.key] === 'string'
                  ? onDoubleClick(event, row[headElem.key] as string)
                  : undefined
              }
            >
              {headElem.tooltip ? (
                <Tooltip title={tooltip ?? row[headElem.key]}>
                  <span>{row[headElem.key]}</span>
                </Tooltip>
              ) : (
                row[headElem.key]
              )}
            </STableCell>
          ),
      )}
    </>
  );
};
