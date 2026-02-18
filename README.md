# Utron Data Grid

Reusable React Data Grid with Material UI: sorting, filtering, inline editing, multi-row selection, pagination, and RTL/LTR support.

## Installation

```bash
npm install utron-data-grid
```

**Peer dependencies** (you must install these in your app):

- `react`, `react-dom`
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `@mui/x-date-pickers`, `dayjs`

## Quick start

```jsx
import { DataGrid } from 'utron-data-grid';

const columns = [
  { field: 'name', headerName: 'Name', type: 'text', filter: 'text' },
  { field: 'age', headerName: 'Age', type: 'number', filter: 'number' },
];

const rows = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
];

<DataGrid
  rows={rows}
  columns={columns}
  getRowId={(row) => row.id}
/>
```

## Props (API)

**Required (top-level):**

| Prop | Type | Description |
|------|------|-------------|
| `rows` | `Array<Object>` | Data rows |
| `columns` | `ColumnDef[]` | Column definitions (see Configuration) |
| `getRowId` | `(row) => string \| number` | Required for selection/edit; returns unique id |

**Optional:**

| Prop | Type | Description |
|------|------|-------------|
| `options` | `DataGridOptions` | All optional overrides (see below). New features add keys here to keep the API stable. |
| `sx` | `object` | MUI sx for root container (can also be passed as `options.sx`) |

**`options` (DataGridOptions) – all optional:**

| Key | Type | Description |
|-----|------|-------------|
| `translations` | `Object` | i18n map (see Translations) |
| `direction` | `'ltr' \| 'rtl'` | Layout direction (default `'ltr'`) |
| `sortModel` | `Array<{ field, order }>` | Controlled sort |
| `filterModel` | `Object` | Controlled filters |
| `onSortChange` | `(sortModel) => void` | Sort change callback |
| `onFilterChange` | `(filterModel) => void` | Filter change callback |
| `onEditCommit` | `(rowId, row) => void` | Commit edited row (enables inline edit when provided) |
| `onEditStart` | `(rowId, row) => void` | When entering edit |
| `onEditCancel` | `(rowId) => void` | When user cancels edit |
| `onValidationFail` | `(rowId, errors) => void` | When Save fails validation |
| `isRowEditable` | `(row) => boolean` | Only these rows are editable |
| `onSelectionChange` | `(selectedIds) => void` | Selection change |
| `onRowSelect` | `(rowId, row) => void` | When a row is clicked |
| `editable` | `boolean` | Master switch for inline edit (default false) |
| `multiSelectable` | `boolean` | Show checkboxes and selection (default false) |
| `pagination` | `boolean` | Enable client-side pagination (default false) |
| `pageSize` | `number` | Rows per page (default 10) |
| `pageSizeOptions` | `number[]` | Page size dropdown options (e.g. [10, 25, 50]) |
| `page` | `number` | Controlled current page (0-based) |
| `onPageChange` | `(page) => void` | Page change callback |
| `onPageSizeChange` | `(pageSize) => void` | Page size change callback |
| `sx` | `object` | MUI sx for root container |
| `headerConfig` | `object` | `base` (MUI sx for TableHead), `mainRow`, `filterRows`, `filterCells` (e.g. `backgroundColor`, `height`) |
| `selectedRowStyle` | `object` | MUI sx for selected rows |

## Configuration (columns)

Each column can define:

- `field` (string) – key in row object
- `headerName` (string)
- `type` – `'text' | 'number' | 'date' | 'datetime' | 'list'`
- `filter` – same as type or `false` to disable
- `filterOptions.listValues` – for list filter options
- `editable` – `boolean | ((row) => boolean)` – enables editing. Use a function for conditional editing based on row data
- `width` – number (px) for fixed width
- `flex` – number for proportional grow factor (columns share remaining space proportionally)
- `minWidth` – number (px) for minimum width constraint
- `maxWidth` – number (px) for maximum width constraint
- `defaultWidth` – number (px) for optional default width (useful for action/icon columns)
- `validators` – `[{ validate: (value, row) => boolean|string, message? }]`
- `options` – for list type (dropdown options)
- `render(value, row)` – custom display (not used when editing)
- `rowStyle(row)` – sx for the row (when this column's condition applies)
- `cellStyle(value, row)` – sx for the cell
- `align` – `'left' | 'right' | 'center'`

### Column Width System

The grid supports flexible column width management:

- **Fixed width**: Set `width` (in pixels) for a column that maintains a constant size
- **Flexible width**: Set `flex` (number) for columns that grow proportionally to fill remaining space
- **Auto-sizing**: If neither `width` nor `flex` is provided, the column is auto-sized based on content
- **Constraints**: Use `minWidth` and `maxWidth` to limit column sizes
- **Manual resizing**: Users can drag column borders to resize (resized columns are automatically excluded from flex distribution)

Built-in minimum widths:
- Columns with filter combo (number/date/text):135px
- Columns without filter combo: 85px
- Effective minimum = max(user `minWidth`, built-in minimum)

**Column Resizing**: Users can manually resize columns by dragging the border between column headers. Resized columns are automatically "frozen" and excluded from flex/auto distribution, maintaining their user-set width. The resize handle is an 8px invisible drag area on the right edge of each column header.

Examples:

```js
// Fixed width
{ field: 'price', headerName: 'Price', type: 'number', filter: 'number', editable: true, width: 100 }

// Flexible width (grows proportionally)
{ field: 'description', headerName: 'Description', type: 'text', flex: 2 }

// Auto-sized with constraints
{ field: 'name', headerName: 'Name', type: 'text', minWidth: 150, maxWidth: 300 }

// Fixed width with constraints
{ field: 'status', headerName: 'Status', type: 'list', width: 120, minWidth: 100, maxWidth: 200 }
```

Conditional editing example:

```js
{ 
  field: 'notes', 
  headerName: 'Notes', 
  type: 'text', 
  editable: (row) => row.status === 'Pending'  // Only editable for pending rows
}
```

## Translations

Pass `options={{ translations: { ... } }}` with keys overriding defaults. Main keys:

- Sort: `clearSort`, `sortAsc`, `sortDesc`
- Filter: `filterPlaceholder`, `selectOption`
- Operators: `operatorEquals`, `operatorNotEqual`, `operatorGreaterThan`, etc.
- Pagination: `rowsPerPage`, `paginationRange`, `firstPage`, `lastPage`, `prevPage`, `nextPage`
- State: `noRows`, `noResults`
- Edit: `save`, `cancel`, `edit`
- Validation: `validationErrors`, `validationRequired`

`paginationRange` supports `{{from}}`, `{{to}}`, `{{count}}`.

## RTL / LTR

Pass `options={{ direction: 'rtl' }}` for right-to-left. Date format: LTR uses MM-DD-YYYY, RTL uses DD-MM-YYYY. Column alignment and pagination controls follow direction.

## Pagination

Pass `options={{ pagination: true, pageSize: 10, pageSizeOptions: [10, 25, 50, 100] }}`. Optionally control `page` and use `onPageChange` / `onPageSizeChange` in options.

## Building / consuming the library

```bash
npm run build
```

Output is in `dist/`. Apps can import:

```js
import DataGrid from 'utron-data-grid';
```

Use the library in your app’s React tree with your own MUI theme if needed; the grid can also wrap with its own ThemeProvider for `direction`.

## Examples

See the `examples/` folder: column config, sample data, translations, and a full demo (`DataGridExample.jsx`). Run the dev server:

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

## Security

**Frontend:** Filter and editor inputs are limited in length (e.g. 500 chars for text, 50 for numbers). All displayed values are rendered via React (no `dangerouslySetInnerHTML`). List options come from config only.

**Backend:** You must enforce authorization, validate and sanitize all inputs, enforce row limits and rate limits, and never rely on frontend-only checks.
