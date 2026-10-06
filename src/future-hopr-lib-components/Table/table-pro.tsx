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
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import { v } from '../../theme';

const STable = styled(Table)`
  tr.onRowClick {
    cursor: pointer;
  }
  tr.activeRow,
  tr.activeRow:hover {
    background: ${v.accentSoft};
  }
  td.select,
  th.select {
    width: 36px;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 10px;
    padding-right: 0;
    .MuiCheckbox-root {
      padding: 4px;
    }
  }
  th.align-right .MuiTableSortLabel-root {
    flex-direction: row-reverse;
  }
  .MuiTableSortLabel-root {
    color: inherit;
    &:hover {
      color: ${v.text};
    }
    &.Mui-active {
      color: ${v.text};
    }
    .MuiTableSortLabel-icon {
      font-size: 14px;
      margin-left: 2px;
    }
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
  &.align-right {
    text-align: right;
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
  gap: 12px;
  min-height: 32px;
  .table-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
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
    [key: string]: React.ReactNode;
    id: string | number;
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
    // row field to sort this column by (when the cell itself is JSX)
    sortKey?: string;
    sortable?: boolean;
    align?: 'left' | 'right';
  }[];
  search?: boolean;
  loading?: boolean;
  onRowClick?: Function;
  orderByDefault?: string;
  orderDefault?: 'asc' | 'desc';
  // row selection (bulk actions); rows are identified by `id`
  selectable?: boolean;
  selected?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  isRowSelectable?: (row: Props['data'][0]) => boolean;
  // highlighted row (e.g. the one shown in a detail panel)
  activeRowId?: string | number | null;
  emptyText?: string;
  toolbar?: React.ReactNode;
}

type RowData = Props['data'][0];

type TableContext = {
  tableId?: string;
  header: Props['header'];
  onRowClick?: Function;
  activeRowId?: string | number | null;
};

type Order = 'asc' | 'desc';

const isString = (value: any) => typeof value === 'string' || value instanceof String;

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (!isString(value)) return null;
  const n = Number((value as string).replace(/,/g, '').split(' ')[0]);
  return (value as string).trim() !== '' && Number.isFinite(n) ? n : null;
};

function descendingComparator(a: { [key in string]: unknown }, b: { [key in string]: unknown }, orderBy: string) {
  const na = asNumber(a[orderBy]);
  const nb = asNumber(b[orderBy]);
  if (na !== null && nb !== null) return nb < na ? -1 : nb > na ? 1 : 0;
  if (isString(b[orderBy]) && isString(a[orderBy])) {
    const sa = (a[orderBy] as string).toLowerCase();
    const sb = (b[orderBy] as string).toLowerCase();
    return sb < sa ? -1 : sb > sa ? 1 : 0;
  }
  // values that cannot be compared (e.g. JSX) keep their order
  return 0;
}

function getComparator(order: Order, orderBy: string) {
  return order === 'desc'
    ? (a: { [key in string]: unknown }, b: { [key in string]: unknown }) => descendingComparator(a, b, orderBy)
    : (a: { [key in string]: unknown }, b: { [key in string]: unknown }) => -descendingComparator(a, b, orderBy);
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
      className={`${context?.onRowClick ? 'onRowClick' : ''} ${
        context?.activeRowId !== undefined && context?.activeRowId !== null && context.activeRowId === item.id
          ? 'activeRow'
          : ''
      }`}
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
  const [order, setOrder] = React.useState<Order>(props.orderDefault ?? 'asc');
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

  const sortField = props.header.find((h) => h.key === orderBy)?.sortKey ?? orderBy;

  const handleSort = (key: string) => {
    if (orderBy === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setOrderBy(key);
      setOrder('asc');
    }
  };

  const selectableRows = props.selectable
    ? filteredData.filter((row) => (props.isRowSelectable ? props.isRowSelectable(row) : true))
    : [];
  const selectedSet = new Set(props.selected ?? []);
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedSet.has(row.id));
  const someSelected = selectableRows.some((row) => selectedSet.has(row.id));
  const toggleAll = () => props.onSelectionChange?.(allSelected ? [] : selectableRows.map((row) => row.id));
  const toggleRow = (id: string | number) =>
    props.onSelectionChange?.(
      selectedSet.has(id) ? (props.selected ?? []).filter((x) => x !== id) : [...(props.selected ?? []), id],
    );

  const sortedRows = React.useMemo(
    () => [...filteredData].sort(getComparator(order, sortField)),
    [filteredData, order, sortField],
  );

  return (
    <STableContainer component={Paper}>
      {(props.search || props.toolbar) && (
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
          {props.toolbar && <div className="table-toolbar">{props.toolbar}</div>}
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
          activeRowId: props.activeRowId,
        }}
        components={virtuosoComponents}
        fixedHeaderContent={() => (
          <TableRow>
            {props.selectable && (
              <STableCell className="TableCell TableCellHeader select">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  disabled={selectableRows.length === 0}
                  onChange={toggleAll}
                  inputProps={{ 'aria-label': 'Select all rows' }}
                />
              </STableCell>
            )}
            {props.header.map(
              (headElem, idx) =>
                !headElem.hidden && (
                  <STableCell
                    key={idx}
                    className={`TableCell TableCellHeader ${headElem.key} ${
                      headElem.align === 'right' ? 'align-right' : ''
                    }`}
                    width={headElem?.width ?? ''}
                    sortDirection={orderBy === headElem.key ? order : false}
                  >
                    <Tooltip
                      title={headElem.tooltipHeader}
                      notWide
                    >
                      {headElem.sortable === false || headElem.key === 'actions' ? (
                        <span>{headElem.name}</span>
                      ) : (
                        <TableSortLabel
                          active={orderBy === headElem.key}
                          direction={orderBy === headElem.key ? order : 'asc'}
                          onClick={() => handleSort(headElem.key)}
                        >
                          {headElem.name}
                        </TableSortLabel>
                      )}
                    </Tooltip>
                  </STableCell>
                ),
            )}
          </TableRow>
        )}
        itemContent={(_index, row) => (
          <>
            {props.selectable && (
              <STableCell
                className="TableCell select"
                onClick={(event) => event.stopPropagation()}
              >
                <Checkbox
                  size="small"
                  checked={selectedSet.has(row.id)}
                  disabled={props.isRowSelectable ? !props.isRowSelectable(row) : false}
                  onChange={() => toggleRow(row.id)}
                  inputProps={{ 'aria-label': 'Select row' }}
                />
              </STableCell>
            )}
            <RowCells
              row={row}
              header={props.header}
            />
          </>
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
            props.emptyText ?? 'No entries'
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
              className={`TableCell ${headElem.key} ${headElem.wrap ? 'wrap' : ''} ${
                headElem.align === 'right' ? 'align-right' : ''
              }`}
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
