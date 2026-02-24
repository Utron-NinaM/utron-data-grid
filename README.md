# Utron Data Grid

Reusable React Data Grid with Material UI: sorting, filtering, inline editing, multi-row selection, pagination, and RTL/LTR support.

## Installation

```bash
npm install utron-data-grid
```

**Peer dependencies** (you must install these in your app):

- `react`, `react-dom`
- `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`
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
| `onSortChange` | `(sortModel) => void` | Sort change callback (notification only) |
| `onFilterChange` | `(filterModel) => void` | Filter change callback (notification only) |
| `onEditCommit` | `(rowId, row) => void` | Commit edited row (enables inline edit when provided) |
| `onEditStart` | `(rowId, row) => void` | When entering edit |
| `onEditCancel` | `(rowId) => void` | When user cancels edit |
| `onValidationFail` | `(rowId, errors) => void` | When Save fails validation |
| `isRowEditable` | `(row) => boolean` | Only these rows are editable |
| `onSelectionChange` | `(selectedIds) => void` | Selection change |
| `onRowSelect` | `(rowId, row) => void` | When a row is clicked |
| `onRowDoubleClick` | `(row) => void` | When a row is double-clicked |
| `editable` | `boolean` | Master switch for inline edit (default false) |
| `reserveEditToolbarSpace` | `boolean` | When true and editable, always reserve space for the edit toolbar so layout does not jump when entering/leaving edit mode |
| `editToolbarHeight` | `number` | Height in px for the reserved edit toolbar slot when `reserveEditToolbarSpace` is true (default 30) |
| `filters` | `boolean` | Show filter row (default true). Set to `false` to hide all filters. |
| `fitToContainer` | `boolean` | When true, treat columns without width/flex as flexible (flex: 1) and cap total width to the container (default false). Use for grids that should always fit the available width. |
| `multiSelectable` | `boolean` | Show checkboxes and selection (default false) |
| `pagination` | `boolean` | Enable client-side pagination (default false) |
| `pageSize` | `number` | Rows per page (default 10) |
| `pageSizeOptions` | `number[]` | Page size dropdown options (e.g. [10, 25, 50]) |
| `onPageChange` | `(page) => void` | Page change callback (notification only) |
| `onPageSizeChange` | `(pageSize) => void` | Page size change callback |
| `sx` | `object` | MUI sx for root container. When pagination is true and `sx` includes `height` or `maxHeight`, the table body scrolls and the pagination bar stays visible. |
| `headerConfig` | `object` | `base` (MUI sx for TableHead), `mainRow`, `filterRows`, `filterCells`. Each row object accepts `backgroundColor`, `height`, and any MUI sx (e.g. `fontSize`, `fontWeight`, `fontFamily`) to override grid-level typography for that row. |
| `bodyRow` | `object` | Body row config: `height`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, and any MUI sx. Used for both view and edit modes so row height and padding stay stable when editing. Default used when undefined (`height: 36`, padding 2px/4px). |
| `selectedRowStyle` | `object` | MUI sx for selected rows |
| `gridId` | `string` | Unique id for this grid; when set, sort, filter, and column width overrides are persisted in localStorage (`utron-datagrid-sort-{gridId}`, `utron-datagrid-filters-{gridId}`, `utron-datagrid-column-widths-{gridId}`) and restored on load. Use a different id per grid when multiple grids exist. |
| `toolbarActions` | `ReactNode` or `(params: { selectedRow, selectedRowId }) => ReactNode` | Optional content on the right side of the toolbar row (same row as Clear sort / Clear filters / Reset column widths). Use for row actions (e.g. Release, Edit, Cancel). If a function, receives current selected row and id. |
| `toolbarClearButtonsSx` | `object` | MUI sx applied to the Clear sort, Clear all filters, and Reset column widths toolbar buttons. |
| `fontSize` | `number` | Font size in px for cells, filters, inputs, pagination (default 13). |
| `showHorizontalScrollbar` | `boolean` | When true and horizontal scroll is enabled (e.g. containScroll with overflow), show the horizontal scrollbar on the header (default false). Useful for very narrow windows. |
| `fontFamily` | `string` | Font family for all grid components (e.g. `'Roboto, sans-serif'`, `var(--app-font-family)`). Cascades from root. |
| `fontWeight` | `number` or `string` | Font weight (e.g. `400`, `600`, `'bold'`). Cascades from root. |

## Configuration (columns)

Each column can define:

- `field` (string) – key in row object
- `headerName` (string)
- `type` – `'text' | 'number' | 'date' | 'datetime' | 'list'`
- `filter` – same as type or `false` to disable
- `filterOptions.listValues` – for list filter options (same shape as `options` for list type)
- `editable` – `boolean | ((row) => boolean)` – enables editing. Use a function for conditional editing based on row data
- `width` – number (px) for fixed width
- `flex` – number for proportional grow factor (columns share remaining space proportionally)
- `minWidth` – number (px) for minimum width constraint. When set, fully overrides the built-in minimum (may be lower). Very small values may cause layout and usability issues.
- `maxWidth` – number (px) for maximum width constraint
- `defaultWidth` – number (px) for optional default width (useful for action/icon columns)
- `validators` – `[{ validate: (value, row) => boolean|string, message? }]`
- `options` – for list type: array of `{ value, label }` (see List columns below)
- `render(value, row)` – custom display (not used when editing)
- `getTooltipText(value, row)` – optional. When set, used as the cell tooltip string (e.g. for columns that render React elements like Autocomplete, so the tooltip shows the label instead of "[object Object]").
- `rowStyle(row)` – sx for the row (when this column's condition applies)
- `cellStyle(value, row)` – sx for the cell
- `align` – `'left' | 'right' | 'center'`

### List columns and list filter options

For `type: 'list'` (and list filters), options must be an array of **keyed options**: `Array<{ value: Key, label: string }>`.

- **`value`** (the key) must be **primitive and JSON-serializable** (string, number, or boolean). Do not use objects as keys.
- **Row data** for that field must store the same **key** (e.g. `row.status === 'published'`), not the label.
- **`label`** is the display text and can be translated per locale; the grid shows the label in cells and in the filter dropdown.
- `onListInputChange(value)` – optional. Called when the user types in the list Autocomplete input. Use for dynamic option fetching or search-as-you-type. Called only on user input (`reason === 'input'`). Empty/whitespace input is omitted (consistent with EditContentModal).

The grid persists list filter selections by **key** in local storage, so filters remain active when switching languages or direction (RTL/LTR). List filter value is always an array: empty array = no selection, one or more keys = selected.

```js
{
  field: 'status',
  type: 'list',
  options: [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' }
  ],
  filterOptions: { listValues: [/* same { value, label } array */] }
}
```

### Column Width System

The grid supports flexible column width management:

- **Fixed width**: Set `width` (in pixels) for a column that maintains a constant size
- **Flexible width**: Set `flex` (number) for columns that grow proportionally to fill remaining space
- **Auto-sizing** (default when `fitToContainer: false`): If neither `width` nor `flex` is provided, the column is auto-sized based on content and can overshoot the container
- **Fit-to-container** (when `fitToContainer: true`): Columns without `width` or `flex` are treated as `flex: 1`, sharing available width and staying within the container. Total width is capped to the container, preventing overflow
- **Constraints**: Use `minWidth` and `maxWidth` to limit column sizes
- **Manual resizing**: Users can drag column borders to resize (resized columns are automatically excluded from flex distribution)

Built-in minimum widths:
- Built-in minimum: 110px when filters are shown, 85px when `filters: false`.
- If `minWidth` is set on a column, it fully overrides the built-in (user can go lower). Very small values may cause layout and usability issues.

**Column Resizing**: Users can manually resize columns by dragging the border between column headers. Resized columns are automatically "frozen" and excluded from flex/auto distribution, maintaining their user-set width. The resize handle is an 8px invisible drag area on the right edge of each column header.

**Column width persistence**: When `options.gridId` is set, column width overrides are stored in localStorage under `utron-datagrid-column-widths-{gridId}` and restored on load (same pattern as sort and filter). A "Reset column widths" toolbar button (next to Clear sort and Clear all filters) clears all width overrides and is disabled when there are none.

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

- Sort: `clearSort`, `sortAsc`, `sortDesc`, `sortMultiColumnHint`
- Toolbar: `clearAllFilters`, `clearColumnFilter`, `clearColumnWidths`
- Filter: `filterPlaceholder`, `filterNumber`, `filterDate`, `selectOption`, `filterFrom`, `filterTo`
- Operators: `operatorEquals`, `operatorNotEqual`, `operatorGreaterThan`, etc.
- Pagination: `rowsPerPage`, `paginationRange`, `firstPage`, `lastPage`, `prevPage`, `nextPage`
- State: `noRows`, `noResults`
- Edit: `save`, `cancel`, `edit`
- Validation: `validationErrors`, `validationRequired`

`paginationRange` supports `{{from}}`, `{{to}}`, `{{count}}`.

## RTL / LTR

Pass `options={{ direction: 'rtl' }}` for right-to-left. Date format: LTR uses MM-DD-YYYY, RTL uses DD-MM-YYYY. Column alignment and pagination controls follow direction.

## Pagination

Pass `options={{ pagination: true, pageSize: 10, pageSizeOptions: [10, 25, 50, 100] }}`. Use `onPageChange` and `onPageSizeChange` for notifications when the user changes page or page size.

## Exports

Besides `DataGrid`, the package exports:

- `GridErrorBoundary` – Error boundary for the grid
- `defaultTranslations`, `hebrewTranslations` – Translation presets
- Schema constants: `FIELD_TYPE_*`, `FILTER_TYPE_*`, `SORT_ORDER_*`, `ALIGN_*`, `DIRECTION_*`, `OPERATOR_*`, `NUMBER_OP_IDS`, `TEXT_OP_IDS`, `DATE_OP_IDS`

## Building / consuming the library

```bash
npm run build
```

Output is in `dist/`. Apps can import:

```js
import { DataGrid } from 'utron-data-grid';
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
