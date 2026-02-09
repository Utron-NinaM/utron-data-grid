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

| Prop | Type | Description |
|------|------|-------------|
| `rows` | `Array<Object>` | Data rows |
| `columns` | `ColumnDef[]` | Column definitions (see Configuration) |
| `getRowId` | `(row) => string \| number` | Required for selection/edit; returns unique id |
| `translations` | `Object` | Optional i18n map (see Translations) |
| `direction` | `'ltr' \| 'rtl'` | Layout direction; affects alignment and date format |
| `sortModel` | `Array<{ field, order }>` | Controlled sort (optional) |
| `filterModel` | `Object` | Controlled filters (optional) |
| `onSortChange` | `(sortModel) => void` | Sort change callback |
| `onFilterChange` | `(filterModel) => void` | Filter change callback |
| `onEditCommit` | `(rowId, row) => void` | Commit edited row (enables inline edit when provided) |
| `onSelectionChange` | `(selectedIds) => void` | Selection change |
| `editable` | `boolean` | Master switch for inline edit (default false) |
| `multiSelectable` | `boolean` | Show checkboxes and selection (default false) |
| `pagination` | `boolean` | Enable client-side pagination (default false) |
| `pageSize` | `number` | Rows per page (default 10) |
| `pageSizeOptions` | `number[]` | Page size dropdown options (e.g. [10, 25, 50]) |
| `page` | `number` | Controlled current page (0-based, optional) |
| `onPageChange` | `(page) => void` | Page change callback |
| `onPageSizeChange` | `(pageSize) => void` | Page size change callback |
| `sx` | `object` | MUI sx for root container |
| `headerStyle` | `object` | MUI sx object for TableHead |
| `selectedRowStyle` | `object` | MUI sx object for selected rows |

## Configuration (columns)

Each column can define:

- `field` (string) – key in row object
- `headerName` (string)
- `type` – `'text' | 'number' | 'date' | 'datetime' | 'list'`
- `filter` – same as type or `false` to disable
- `filterOptions.listValues` – for list filter options
- `editable` (boolean)
- `width` – number (px) or string (e.g. `"20%"`)
- `validators` – `[{ validate: (value, row) => boolean|string, message? }]`
- `options` – for list type (dropdown options)
- `render(value, row)` – custom display (not used when editing)
- `rowStyle(row)` – sx for the row (when this column’s condition applies)
- `cellStyle(value, row)` – sx for the cell
- `align` – `'left' | 'right' | 'center'`

Example:

```js
{ field: 'price', headerName: 'Price', type: 'number', filter: 'number', editable: true, width: 100 }
```

## Translations

Pass a `translations` object with keys overriding defaults. Main keys:

- Sort: `clearSort`, `sortAsc`, `sortDesc`
- Filter: `filterPlaceholder`, `selectOption`
- Operators: `operatorEquals`, `operatorNotEqual`, `operatorGreaterThan`, etc.
- Pagination: `rowsPerPage`, `paginationRange`, `firstPage`, `lastPage`, `prevPage`, `nextPage`
- State: `noRows`, `noResults`
- Edit: `save`, `cancel`, `edit`
- Validation: `validationErrors`, `validationRequired`

`paginationRange` supports `{{from}}`, `{{to}}`, `{{count}}`.

## RTL / LTR

Set `direction="rtl"` for right-to-left. Date format: LTR uses MM-DD-YYYY, RTL uses DD-MM-YYYY. Column alignment and pagination controls follow direction.

## Pagination

Set `pagination` to enable client-side pagination. Use `pageSize` and `pageSizeOptions` (e.g. `[10, 25, 50]`). Optionally control `page` and use `onPageChange` / `onPageSizeChange`.

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
