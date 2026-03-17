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
| `onFilterChange` | `(filterModel, result?) => void` | Called when the user changes filters, clears filters, or when `rows`/filter state change (e.g. initial load, restored filters). Second argument: `result.filteredRowCount` is the number of rows matching the current filters (before pagination). `result.filteredRows` is optional and may be provided for export/summary. |
| `onEditCommit` | `(rowId, row) => void` | Commit edited row (enables inline edit when provided) |
| `onEditStart` | `(rowId, row) => void` | When entering edit |
| `onEditCancel` | `(rowId) => void` | When user cancels edit |
| `onValidationFail` | `(rowId, errors) => void` | When Save fails validation |
| `isRowEditable` | `(row) => boolean` | Only these rows are editable |
| `onSelectionChange` | `(selectedIds) => void` | When the selection set changes (e.g. user selects/deselects rows) |
| `onRowClick` | `(rowId, row) => void` | When a row is clicked (single click). Distinct from selection: use `onSelectionChange` for selection changes. |
| `onRowDoubleClick` | `(row) => void` | When a row is double-clicked. If `editable` is enabled and `onEditCommit` is provided, double-clicking will also start edit mode for the row (or create mode for empty placeholder rows). |
| `editable` | `boolean` | Master switch for inline edit (default false) |
| `reserveEditToolbarSpace` | `boolean` | When true and editable, always reserve space for the edit toolbar so layout does not jump when entering/leaving edit mode |
| `editToolbarHeight` | `number` | Height in px for the reserved edit toolbar slot when `reserveEditToolbarSpace` is true (default 30) |
| `filters` | `boolean` | Show filter row (default true). Set to `false` to hide all filters. |
| `fitToContainer` | `boolean` | When true, treat columns without width/flex as flexible (flex: 1) and cap total width to the container (default false). Use for grids that should always fit the available width. |
| `multiSelectable` | `boolean` | Show checkboxes and allow multi-row selection (default false). When true, clicking a row toggles its selection (same as using the checkbox); the checkbox still works as before. |
| `pagination` | `boolean` | Enable client-side pagination (default false) |
| `pageSize` | `number` | Rows per page (default 10) |
| `pageSizeOptions` | `number[]` | Page size dropdown options (e.g. [10, 25, 50]) |
| `onPageSizeChange` | `(pageSize) => void` | When the user changes page size |
| `sx` | `object` | MUI sx for root container. When `sx` includes `height` or `maxHeight`, the grid uses scrollable layout and vertical body virtualization (see Virtualization). When pagination is true, the table body scrolls and the pagination bar stays visible. |
| `headerConfig` | `object` | `base` (MUI sx for TableHead), `mainRow`, `filterRows`, `filterCells`. Each row object accepts `backgroundColor`, `height`, and any MUI sx (e.g. `fontSize`, `fontWeight`, `fontFamily`) to override grid-level typography for that row. |
| `bodyRow` | `object` | Body row config: `height`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, and any MUI sx. Used for both view and edit modes so row height and padding stay stable when editing. Default used when undefined (`height: 36`, padding 2px/4px). |
| `selectedRowStyle` | `object` | MUI sx for selected rows |
| `disableRowHover` | `boolean` | When true, no row hover styling (default false). |
| `rowHoverStyle` | `object` | MUI sx for row hover (e.g. `{ '&:hover': { backgroundColor: '...' } }`). When set, overrides default hover; selected row on hover still uses selected style. Per-row overrides via column `rowStyle(row)` with `'&:hover'` also take precedence over the default. |
| `gridId` | `string` | Unique id for this grid; when set, sort, filter, and column width overrides are persisted in localStorage (`utron-datagrid-sort-{gridId}`, `utron-datagrid-filters-{gridId}`, `utron-datagrid-column-widths-{gridId}`) and restored on load. Use a different id per grid when multiple grids exist. |
| `toolbarActions` | `ReactNode` or `(params: { selectedRow, selectedRowId }) => ReactNode` | Optional content on the right side of the toolbar row (same row as Clear sort / Clear filters / Reset column widths). Use for row actions (e.g. Release, Edit, Cancel). If a function, receives current selected row and id. |
| `toolbarClearButtonsSx` | `object` | MUI sx applied to the Clear sort, Clear all filters, and Reset column widths toolbar buttons. |
| `editToolbarSaveButtonSx` | `object` | MUI sx applied to the Save button in the edit toolbar. |
| `editToolbarCancelButtonSx` | `object` | MUI sx applied to the Cancel button in the edit toolbar. |
| `fontSize` | `number` | Font size in px for cells, filters, inputs, pagination (default 13). |
| `showHorizontalScrollbar` | `boolean` | When true and horizontal scroll is enabled (e.g. containScroll with overflow), show the horizontal scrollbar on the header (default false). Useful for very narrow windows. |
| `fontFamily` | `string` | Font family for all grid components (e.g. `'Roboto, sans-serif'`, `var(--app-font-family)`). Cascades from root. |
| `fontWeight` | `number` or `string` | Font weight (e.g. `400`, `600`, `'bold'`). Cascades from root. |
| `dropdownBoundaryRef` | `React.RefObject<HTMLElement \| null>` | Ref to the element that defines the clipping area for list and filter dropdowns (e.g. the main content wrapper that excludes sidebars). When set, dropdowns stay within this element's bounds; omit to use the viewport. Works for RTL and LTR. |

## Configuration (columns)

Each column can define:

- `field` (string) – key in row object
- `headerName` (string)
- `type` – `'text' | 'number' | 'date' | 'datetime' | 'list'`
- `filter` – same as type or `false` to disable
- `filterOptions.listValues` – for list filter options (same shape as `options` for list type)
- `editable` – `boolean` – enables editing and adding this field (default false). When true, the field can be edited in existing rows and added in new rows.
- `addable` – `boolean` – enables adding this field in new rows only (default false). When true, the field can be added when creating new rows but cannot be edited in existing rows (unless `editable` is also true).
- `width` – number (px) for fixed width, or string percentage (e.g. `"20%"`, `"25%"`) for a share of the container width
- `flex` – number for proportional grow factor (columns share remaining space proportionally)
- `minWidth` – number (px) for minimum width constraint. When set, fully overrides the built-in minimum (may be lower). Very small values may cause layout and usability issues.
- `maxWidth` – number (px) for maximum width constraint
- `defaultWidth` – number (px) for optional default width (useful for action/icon columns)
- `validators` – `[{ validate: (value, row) => boolean|string, message? }]` – run on cell blur (that field only) and on Save (full row). Return `false` or a non-empty string for error; `message` is used when validator returns `false`. Errors use column `field` (not `headerName`).
- `options` – for list type: array of `{ value, label, description? }` (see List columns below)
- `listDescriptionField` – for list type only: row field name where the selected option's `description` is written when present (complex list; see List columns below)
- `listDropdownSx` – for list type only: optional MUI sx applied to the list editor dropdown (popper and listbox). Use to override width, fontSize, fontWeight, etc. Default: dropdown is not constrained to column width, max width 200px; options show on one line with ellipsis when long.
- `render(value, row)` – custom display (not used when editing)
- `getTooltipText(value, row)` – optional. When set, used as the cell tooltip string (e.g. for columns that render React elements like Autocomplete, so the tooltip shows the label instead of "[object Object]").
- `rowStyle(row)` – sx for the row (when this column's condition applies)
- `cellStyle(value, row)` – sx for the cell
- `align` – `'left' | 'right' | 'center'`

### List columns and list filter options

For `type: 'list'` (and list filters), options must be an array of **keyed options**: `Array<{ value: Key, label: string, description?: string }>`.

- **`value`** (the key) must be **primitive and JSON-serializable** (string, number, or boolean). Do not use objects as keys.
- **Row data** for that field must store the same **key** (e.g. `row.status === 'published'`), not the label.
- **`label`** is the display text and can be translated per locale; the grid shows the label in cells and in the filter dropdown.
- **`description`** (optional) – when used with **`listDescriptionField`**, the grid writes this into the named row field on selection (see Complex list below).
- **`listDescriptionField`** (optional) – for list columns only. When set, selecting an option that has a `description` also sets `row[listDescriptionField] = option.description` in the same edit/commit. Use for "complex" list columns where the row stores code in the list field and description in a separate field (e.g. `field: 'sku'`, `listDescriptionField: 'skuDescription'`).
- `onListInputChange(value)` – optional. Called when the user types in the list Autocomplete input. Use for dynamic option fetching or search-as-you-type. Called only on user input (`reason === 'input'`). Empty/whitespace input is omitted (consistent with EditContentModal).
- **List editor dropdown:** When editing a list column, the dropdown is not constrained to the column width: it has a default max width of 200px so long labels (e.g. code + description) are readable. Each option is shown on a single line; overflow is truncated with an ellipsis. Use **`listDropdownSx`** on the column to override dropdown/listbox style (e.g. `maxWidth`, `fontSize`, `fontWeight`).

The grid persists list filter selections by **key** in local storage, so filters remain active when switching languages or direction (RTL/LTR). List filter value is always an array: empty array = no selection, one or more keys = selected.

**Regular list** (only the list field is updated):

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

**Complex list** (list field + description field updated on selection):

```js
{
  field: 'sku',
  type: 'list',
  listDescriptionField: 'skuDescription',
  options: [
    { value: '201', label: '201 Envelopes 3424 A4', description: 'Envelopes 3424 A4' },
    { value: '202', label: '202 Folders C5', description: 'Folders C5' }
  ]
}
// After user selects first option: row has sku: '201' and skuDescription: 'Envelopes 3424 A4'
```

### Column Width System

The grid supports flexible column width management:

- **Fixed width**: Set `width` (number in pixels) for a column that maintains a constant size
- **Percentage width**: Set `width` (string like `"20%"`) for columns that take a percentage of container width. Percentage values are converted to pixels during layout calculation and respect `minWidth`/`maxWidth` constraints
- **Flexible width**: Set `flex` (number) for columns that grow proportionally to fill remaining space
- **Auto-sizing** (default when `fitToContainer: false`): If neither `width` nor `flex` is provided, the column is auto-sized based on content and can overshoot the container
- **Fit-to-container** (when `fitToContainer: true`): Columns without `width` or `flex` are treated as `flex: 1`, sharing available width and staying within the container. Total width is capped to the container, preventing overflow
- **Constraints**: Use `minWidth` and `maxWidth` to limit column sizes
- **Manual resizing**: Users can drag column borders to resize (resized columns are automatically excluded from flex distribution). When a percentage column is resized, it is converted to a fixed pixel width

Built-in minimum widths:
- Built-in minimum: 110px when filters are shown, 85px when `filters: false`.
- If `minWidth` is set on a column, it fully overrides the built-in (user can go lower). Very small values may cause layout and usability issues.

**Column Resizing**: Users can manually resize columns by dragging the border between column headers. Resized columns are automatically "frozen" and excluded from flex/auto distribution, maintaining their user-set width. The resize handle is an 8px invisible drag area on the right edge of each column header.

**Column width persistence**: When `options.gridId` is set, column width overrides are stored in localStorage under `utron-datagrid-column-widths-{gridId}` and restored on load (same pattern as sort and filter). A "Reset column widths" toolbar button (next to Clear sort and Clear all filters) clears all width overrides and is disabled when there are none.

Examples:

```js
// Fixed width
{ field: 'price', headerName: 'Price', type: 'number', filter: 'number', editable: true, width: 100 }

// Percentage width
{ field: 'name', headerName: 'Name', type: 'text', width: "25%" }

// Flexible width (grows proportionally)
{ field: 'description', headerName: 'Description', type: 'text', flex: 2 }

// Auto-sized with constraints
{ field: 'category', headerName: 'Category', type: 'text', minWidth: 150, maxWidth: 300 }

// Fixed width with constraints
{ field: 'status', headerName: 'Status', type: 'list', width: 120, minWidth: 100, maxWidth: 200 }
```

### Inline validation

When `onEditCommit` is set and columns define `validators`, the grid runs **field-level validation on cell blur** and **full row validation on Save**:

- **Blur:** Only the field that lost focus is validated; errors are merged for that field.
- **Save:** All editable columns are validated; if any errors exist, commit is blocked and `onValidationFail(rowId, errors)` is called.
- **On value change:** The error for that field is cleared immediately so the red border and banner update as the user fixes the value.

**UI:** A sliding error banner appears above the table (no reserved space when there are no errors). The banner shows the total count and a list of errors (by row and field); clicking an error scrolls to that row. Cells with errors get a red border and show the message in a tooltip; the row is marked with a left border accent. Use `getCellError(rowId, field)` and `hasRowError(rowId)` from the edit store for custom UI.

Editing and adding examples:

```js
// Editable in existing rows and addable in new rows
{ 
  field: 'name', 
  headerName: 'Name', 
  type: 'text', 
  editable: true
}

// Only addable in new rows (not editable in existing rows)
{ 
  field: 'id', 
  headerName: 'ID', 
  type: 'text', 
  addable: true,
  editable: false
}

// Addable in new rows and also editable in existing rows
{ 
  field: 'status', 
  headerName: 'Status', 
  type: 'list', 
  editable: true,
  addable: true
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
- Validation: `validationErrors`, `validationErrorsFound` (title with `{{count}}`), `validationFieldErrorsCount` (badge with `{{count}}`), `validationRequired`

`paginationRange` supports `{{from}}`, `{{to}}`, `{{count}}`.

## RTL / LTR

Pass `options={{ direction: 'rtl' }}` for right-to-left. Date format: LTR uses MM-DD-YY, RTL uses DD-MM-YY. Column alignment and pagination controls follow direction.

## Dropdowns and sidebars

When the grid is inside a layout with a fixed sidebar (e.g. a collapsed or expanded nav strip), list and filter dropdowns can be partially hidden by the sidebar because they are positioned relative to the viewport. To keep dropdowns inside the main content area, pass a ref to that area as **`dropdownBoundaryRef`**:

```jsx
import { useRef } from 'react';
import { DataGrid } from 'utron-data-grid';
import { Box } from '@mui/material';

const mainContentRef = useRef(null);

// Layout: sidebar + main content (works for both LTR and RTL)
<Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', direction: direction }}>
  <Box sx={{ width: 56, flexShrink: 0, backgroundColor: '#c62828', minHeight: '100vh' }} />
  <Box ref={mainContentRef} sx={{ flex: 1, minWidth: 0, padding: 2, direction }}>
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      options={{
        direction,
        dropdownBoundaryRef: mainContentRef,
        // ...other options
      }}
    />
  </Box>
</Box>
```

- Attach the ref to the **main content** container (the element that contains the grid and does **not** include the sidebar).
- In RTL, place the sidebar on the right (e.g. use `direction: 'rtl'` on the flex container so the first child appears on the right).
- When the sidebar opens or closes, the main content resizes; the next time a dropdown opens it will use the updated bounds. If the user toggles the sidebar while a dropdown is open, close and reopen the dropdown to reposition.

## Row selection and always-visible controls

The grid applies **selection highlight via CSS** (not by re-rendering the row). So when the user clicks a cell that contains an always-visible control (e.g. a Priority dropdown), the row is selected and the control can open in the **same click**—no second click needed.

If your app updates state in `onRowClick` (e.g. `setSelectedRow(row)` for a toolbar), that re-render can close an open dropdown. To keep single-click-open behavior, either defer updating that state until the control closes (e.g. in the dropdown’s `onClose`) or store the selected row in a ref so the grid does not re-render on selection.

See the **Conditional Editing** example (`examples/ConditionalEditingExample.jsx`) for a working pattern: Priority column with always-visible Autocomplete, selection on click, and selected row display updated when the dropdown closes.

## Pagination

Pass `options={{ pagination: true, pageSize: 10, pageSizeOptions: [10, 25, 50, 100] }}`. Use `onPageSizeChange` to be notified when the user changes page size.

## Virtualization (vertical)

When the grid has a height constraint (`options.sx` with `height` or `maxHeight`), the body uses a **scrollable layout**: the toolbar and header stay fixed and only the table body scrolls. In that mode, the body is **vertically virtualized**:

- Only rows in and near the viewport are rendered (plus a small overscan). Scrolling (wheel, trackpad, Page Up/Down, Home/End, scrollbar drag) updates the visible slice immediately so the viewport does not outrun the rendered content.
- **No spacer rows** – a single translated layer positions the visible slice; `totalBodyHeight` keeps scroll height correct.
- **Overscan** – a few extra rows above and below the viewport reduce the chance of gaps during fast or large scroll jumps.
- **Editing** – the row being edited is always kept in the rendered range so it never disappears during edit mode.

You do not enable virtualization explicitly: it is on whenever the grid root has a height constraint (e.g. `sx: { height: '100%' }` inside a flex container with `minHeight: 0`). Use a constrained height when you need smooth scrolling over large datasets without rendering every row.

## Editing Empty Placeholder Rows

The grid supports editing empty placeholder rows (rows where all fields are `null`, `undefined`, or empty strings). When you double-click an empty row:

- Edit mode starts automatically (if `editable: true` and `onEditCommit` is provided)
- The row enters "create" mode (`editMode === 'create'`)
- The first editable cell automatically receives focus
- Columns with `editable: true` or `addable: true` become editable

This allows users to add new rows by double-clicking empty rows in the grid.

## Programmatic Edit Control

The `DataGrid` component supports a ref API for programmatic control:

```jsx
import { useRef } from 'react';

const gridRef = useRef(null);

<DataGrid
  ref={gridRef}
  rows={rows}
  columns={columns}
  getRowId={(row) => row.id}
  options={{ editable: true, onEditCommit: handleEditCommit }}
/>

// Start editing a row programmatically
gridRef.current?.startEditMode(rowId);
```

The `startEditMode(rowId)` method:
- Finds the row by ID
- Checks if the row is editable (respects `isRowEditable` if provided)
- Automatically detects empty rows and uses create mode
- Starts edit mode and calls `onEditStart` if provided
- Focuses the first editable cell

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

See the `examples/` folder: column config, sample data, translations, and a full demo (`DataGridExample.jsx`). **ConditionalEditingExample.jsx** demonstrates single-click row select + open dropdown (always-visible Priority Autocomplete). Run the dev server:

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

## Security

**Frontend:** Filter and editor inputs are limited in length (e.g. 500 chars for text, 50 for numbers). All displayed values are rendered via React (no `dangerouslySetInnerHTML`). List options come from config only.

**Backend:** You must enforce authorization, validate and sanitize all inputs, enforce row limits and rate limits, and never rely on frontend-only checks.
