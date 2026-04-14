# utron-data-grid — Project Context

## What this is
A reusable React + MUI v5 data grid library (npm package `utron-data-grid`, currently v1.0.106).  
Designed for **large datasets (100k rows)**, performance-critical, with full RTL support.  
Exported as a single compiled bundle from `dist/`. Public API is `src/index.js`.

---

## Tech stack
- React 18, MUI v5, MUI X Date Pickers v6
- Virtualization: `react-virtuoso` (`TableVirtuoso`) for the scroll-contained layout
- Date handling: `dayjs`
- PDF export: `jsPDF` + `jspdf-autotable`
- Icons: FontAwesome (solid + regular)
- State management: custom external stores (`useSyncExternalStore`) — no Redux/Zustand
- Tests: Vitest + @testing-library/react

---

## Directory map

```
src/
  index.js                        Public API exports
  constants.js                    All magic numbers (px values, z-index, storage keys, etc.)
  config/
    schema.js                     Column type / operator / sort / direction constants + ColumnDef JSDoc
    defaultConfig.js              defaultGridConfig, defaultColumnConfig
  DataGrid/
    DataGrid.jsx                  Root component; forwardRef with imperative handle (startEditMode)
    DataGridContext.jsx           3 contexts: DataGridStableContext, DataGridFilterContext, ScrollContainerContext
    useDataGrid.js                Main logic hook — orchestrates all sub-hooks; builds stableContextValue
    useDataGridMaps.js            Computes style Maps (headerCellSxMap, bodyCellSxMap, etc.) from columns/sort/etc.
    useDataGridEdit.js            Edit handlers: double-click → edit, change, blur (field validation), save, cancel
    useColumnLayout.js            Column width layout algorithm (wrapper hook; delegates to calculateColumnWidths)
    useContainerWidth.js          ResizeObserver hook for container/scroll-container width
    editStore.js                  External store for edit state (editRowId, editValues, validationState)
    selectionStore.js             External store for single-row click selection
    EditToolbar.jsx               Save/Cancel buttons rendered when editing
    GridValidationBanner.jsx      Animated error banner above the grid; lists all validation errors
    ValidationAlertSubscriber.jsx Legacy subscriber (currently subscribes to removed validationErrors field)
    dataGridStyles.js             sx helpers for root layout (flex scroll, fonts, alert animations)
  core/
    GridTable.jsx                 Toolbar, header rows, body; two modes: normal vs containScroll
    GridTableBodyVirtuoso.jsx     react-virtuoso TableVirtuoso integration (containScroll only)
    GridBody.jsx                  editStore subscriber; renders TableBody + GridBodyContent
    GridBodyContent.jsx           Pure row mapper: visibleRows → GridBodyRow (no store subscriptions)
    GridBodyRow.jsx               memo; presentational row; focuses first input on edit start
    GridCell.jsx                  memo; renders display value / editor / tooltips / error icon
    GridHeaderCell.jsx            Header cell: sort label, tooltip, filter slot, resize handle
    GridHeaderCellFilter.jsx      Filter or "to" row cell
    SelectionStyleApplicator.jsx  Renders <style> tag for selection highlight — no row re-renders on select
    EditToolbarSubscriber.jsx     Renders EditToolbar only when editRowId != null
    GridToolbarSubscriber.jsx     Renders toolbarActions with current selectedRow
    GridErrorBoundary.jsx         Class component; catches render errors; shows Retry
    useVirtualRows.js             Manual virtualization hook (currently unused in favor of react-virtuoso)
    coreStyles.js                 All sx/style helpers for table, toolbar, header, cells, resize handle
    icons/ExportIcon.jsx          SVG mask icon for CSV/PDF export buttons
  filters/
    FilterBar.jsx                 getHeaderComboSlot / getFilterInputSlot / getFilterToInputSlot factories
    filterUtils.js                applyFilters, matchFilter, isColumnFilterActive; localStorage persistence
    filterBoxStyles.js            All sx helpers for filter inputs, operator dropdown, list filter
    filters/
      TextFilter.jsx
      NumberFilter.jsx            NumberFilterInputs (from) + NumberFilterToInput (to)
      DateFilter.jsx              DateFilterInputs + DateFilterToInput + DateFilterPeriodAmountInput
      ListFilter.jsx              MUI Autocomplete multi-select; resolves keys → option objects
      NumericInput.jsx            NumericTextField (text type + regex; avoids browser number quirks)
      OperatorDropdown.jsx        Operator icon button + Menu; FontAwesome icons from schema.OPERATOR_ICONS
  editors/
    CellEditors.jsx               getEditor() factory: text/number/date/list editors; ListEditor component
    cellEditorStyles.js           getCompactEditorSx, listEditorSx, getListEditorInputSx
  pagination/
    PaginationBar.jsx             Rows-per-page + range display + navigation icons
    PaginationIcons.jsx           RTL-aware first/prev/next/last icon buttons
    paginationUtils.js            slicePage(rows, page, pageSize)
  validation/
    validateRow.js                validateRow (full save) + validateField (blur); returns { field, message, severity }
    ValidationAlert.jsx           Legacy inline alert (superseded by GridValidationBanner)
  utils/
    columnWidthUtils.js           calculateColumnWidths (10-step algorithm), estimateAutoColumnWidth, getEffectiveMinWidth
    columnWidthStorage.js         localStorage persistence for column widths
    sortUtils.js                  applySort (multi-column), localStorage persistence
    directionUtils.js             getDateFormat / getDateTimeFormat / getDefaultAlign
    optionUtils.js                getOptionValue / getOptionLabel / getOptionDescription / getOptionMap
    exportToCsv.js                Blob/URL download; BOM-prefixed UTF-8
    exportToPdf.js                jsPDF + autoTable; chunked (1000 rows/chunk); Hebrew RTL fixup
  localization/
    defaultTranslations.js        EN keys + hebrewTranslations (full RTL set)
    useTranslations.js            Hook; returns t(key, params?) — uses direction to pick EN vs HE
  security/
    sanitize.js                   Documents frontend input-length safeguards (not security enforcement)
```

---

## Architecture: data flow

```
props (rows, columns, getRowId, options)
  └─ useDataGrid()
       ├─ state: internalSort, internalFilter, internalPage, internalPageSize, selection, columnWidthState
       ├─ stores: selectionStore (ref), editStore (ref)  ← useSyncExternalStore, no React re-renders
       ├─ pipeline: rows → applyFilters (debounced 200ms) → applySort → slicePage → displayRows
       ├─ layout: useColumnLayout → useContainerWidth (ResizeObserver) → calculateColumnWidths
       ├─ maps: useDataGridMaps → headerCellSxMap, bodyCellSxMap, filterCellSxMap, rowStylesMap, ...
       ├─ stableContextValue (useMemo; everything consumers need)
       └─ filterContextValue (slot factories; changes with filterModel)

DataGrid (root)
  └─ ThemeProvider (MUI theme with dir, font, RTL overrides)
       └─ DataGridProvider (two contexts: stable + filter)
            ├─ GridValidationBanner
            ├─ [scrollableContentSx Box when useScrollableLayout]
            │    └─ GridTable (memo)
            │         ├─ toolbar (Clear sort/filters/widths, export, toolbarActions)
            │         ├─ TableHead (header rows + filter rows)
            │         └─ body:
            │              Normal mode: GridBody → GridBodyContent → GridBodyRow (rows)
            │              containScroll: GridTableBodyVirtuoso (TableVirtuoso) → GridBodyRow (cellsOnly)
            ├─ EditToolbarSubscriber
            └─ PaginationBar
```

---

## Context split (critical for perf)

`DataGridStableContext` — everything that **rarely changes** (columns, callbacks, stores, style Maps, refs).  
`DataGridFilterContext` — slot factories that change **when filterModel changes**.  
`ScrollContainerContext` — scroll container ref + ready flag for tooltip Popper positioning.

Subscribers use `useSyncExternalStore` for editStore and selectionStore so only the minimal set of components re-renders on selection/edit changes.

---

## Two rendering modes

| Mode | Trigger | Body rendering |
|------|---------|----------------|
| Normal | No `sx.height`/`sx.maxHeight` | MUI `stickyHeader` on `<Table>`; GridBody renders all rows |
| containScroll | `sx.height` or `sx.maxHeight` is set | Header and body are **separate** `<Table>` elements; scroll synced via `onScroll`; body uses `TableVirtuoso` for virtualization |

In containScroll mode: header cols (`colRefs`) and body cols (`bodyColRefs`) are updated imperatively via `useEffect` on `columnWidthMap` change (avoids React reconciliation for column widths).

---

## Column width algorithm (`calculateColumnWidths` — 10 steps)

1. Categorize: **fixed** (explicit px/%, user-resized), **auto** (no width — estimated from header text), **flex** (`col.flex`)
2. Assign fixed widths (clamped by minWidth/maxWidth)
3. Estimate auto column widths (min + max = 2.5× min)
4. Layout invariant: if `minTotal > containerWidth` → return minWidths, enable horizontal scroll
5. Remaining space = containerWidth − fixedTotal − autoMinTotal
6. Distribute to flex columns proportionally; set auto to their min
7. Floor all widths to integers
8. Clamp by minWidth/maxWidth
9. Recompute total
10. Distribute leftover pixels to growable (flex/auto) columns cyclically up to their max

User resize: commits to `columnWidthState` Map (localStorage-persisted) via `handleColumnResize`.  
During drag: col element width updated imperatively (bypasses React state); `resizingColumnRef.current` prevents layout from overwriting drag width.

---

## Edit flow

1. Double-click row OR `ref.startEditMode(rowId)` → `editStore.startEdit(id, row)` or `startNewRowEdit(id)` (for empty rows)
2. `editMode`: `'update'` for existing rows, `'create'` for empty-only-id rows
3. Cell editors rendered by `getEditor()` factory per column type (text/number/date/list)
4. On cell blur → `validateField()` → `editStore.setFieldErrors()`
5. On Save → `validateRow()` → if errors: `editStore.mergeRowErrors()` + `onValidationFail()`; else `onEditCommit(rowId, editValues)` + `editStore.clearEdit()`
6. `editStore.editStateForRow` is a cached derived object — only one subscription needed in GridBody/GridTableBodyVirtuoso
7. Column `addable: true` makes a field editable only in create mode; `editable: true` enables in both modes

---

## Selection

Two independent systems:
- **Single-row click** (`selectionStore`) — external store; `SelectionStyleApplicator` injects a `<style>` tag targeting `tr[data-row-id]` cells. Zero row re-renders on select.
- **Multi-row checkbox** (`selection` Set in React state) — also handled in `SelectionStyleApplicator`.

Row clicks handled via event delegation on `<TableBody onClick>` — not per-row handlers.

---

## Filter model shape

```js
filterModel = {
  [field]: {
    operator: 'operatorContains' | 'operatorEquals' | ...,
    value: string | number | null,
    valueTo: number | null,       // in-range second bound
    periodUnit: 'hours'|'days'|..., // OPERATOR_PERIOD only
  }
}
// List columns: { value: string[] }
```

Filter changes are **debounced 200ms** (lodash debounce) before being applied to rows. Cleared filters apply immediately. Persisted to localStorage per `gridId`.

---

## Column definition shape (`ColumnDef`)

```js
{
  field: string,              // row key
  headerName: string,
  type?: 'text'|'number'|'date'|'datetime'|'list',
  filter?: 'text'|'number'|'date'|'list'|'none'|false,
  width?: number | string,    // px or "20%"
  minWidth?: number,
  maxWidth?: number,
  flex?: number,
  defaultWidth?: number | string,
  editable?: boolean | ((row) => boolean),
  addable?: boolean,          // editable only in create mode
  validators?: [{ validate(value, row): boolean|string, message?: string, rowLevel?: boolean }],
  options?: [{ value, label, description? } | primitive],
  listDescriptionField?: string,
  onListInputChange?: (value: string) => void,
  listDropdownSx?: object,
  render?: (value, row) => ReactNode,
  rowStyle?: (row) => sx,
  cellStyle?: (value, row) => sx,
  getTooltipText?: (value, row) => string,
  align?: 'left'|'right'|'center',
}
```

---

## LocalStorage persistence (keyed by `gridId`)

| Key prefix | Content |
|-----------|---------|
| `utron-datagrid-filters-{gridId}` | filterModel (object) |
| `utron-datagrid-sort-{gridId}` | sortModel (array) |
| `utron-datagrid-column-widths-{gridId}` | column widths (object) |

On load: only entries for known column fields are restored (stale columns silently dropped).

---

## RTL support

- `direction` prop → MUI ThemeProvider direction → all components receive dir from context
- RTL-specific: operator dropdown reverses, date format `DD-MM-YY`, align defaults to right, pagination icon order swaps, PDF column order reversed, Hebrew text reversed for PDF
- `useTranslations()` auto-selects `hebrewTranslations` when `direction === 'rtl'`
- MUI Select icon position patched via theme component override for RTL

---

## Performance rules (do not break)

1. `stableContextValue` is one large `useMemo`; all handlers must be stable `useCallback`s. Adding unstable values causes full tree re-renders.
2. `selectionStore` and `editStore` are **not React state** — they use `useSyncExternalStore`. Never put selection/edit state in `useState` on the hot path.
3. `SelectionStyleApplicator` injects CSS — do not move selection to row props.
4. Event delegation on `<TableBody>` — do not add per-row click handlers.
5. `GridBodyRow` and `GridCell` are `memo` — their props must be stable or primitives.
6. `columnWidthMap` changes trigger imperative DOM updates via `useEffect`, not re-renders.
7. `resizingColumnRef` (a ref, not state) gates layout writes during drag.
8. `debouncedFilterModel` prevents re-filtering on every keystroke.
9. `useDataGridMaps` computes all cell style Maps once per column/sort/config change — not per cell.

---

## Key constraints / invariants

- `getRowId` must return a stable, unique primitive per row.
- `columns` array should be stable (useMemo at call site) to avoid re-computing Maps.
- `containScroll` requires `sx.height` or `sx.maxHeight` to be set; the body scroll container is the Virtuoso scroll parent.
- When `editable: true`, `onEditCommit` is also required; `isRowEditable` is only checked for non-empty rows.
- Empty rows (only id field populated) always enter edit in `'create'` mode via `startNewRowEdit`.
- `fitToContainer: true` (not in public options yet) prevents horizontal scroll by capping total column width to container.
- Scroll-contained wide tables: horizontal overflow lives on the body scroll box (`getScrollInnerBoxSx`); header strip uses a hidden native horizontal bar and syncs `scrollLeft` with the body.

---

## Public API (`src/index.js`)

```js
export { DataGrid }              // main component (forwardRef)
export { GridErrorBoundary }     // wrap DataGrid if you want custom error UI
export { exportToCsv }
export { exportToPdf }
export { defaultTranslations, hebrewTranslations }
// Constants: FIELD_TYPE_*, FILTER_TYPE_*, NUMBER_OP_IDS, TEXT_OP_IDS, DATE_OP_IDS,
//            SORT_ORDER_ASC/DESC, ALIGN_LEFT/RIGHT/CENTER
```

`DataGrid` imperative handle (via `ref`): `{ startEditMode(rowId) }`
