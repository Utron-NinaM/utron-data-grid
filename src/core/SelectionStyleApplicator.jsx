import React, { useContext, useSyncExternalStore, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { SELECTED_ROW_BG } from '../constants';

/**
 * Serialize MUI sx-like object to CSS declaration string for selection highlight.
 * Supports backgroundColor and color; theme values are resolved at render time.
 * @param {Object} sx
 * @param {Object} theme
 * @returns {string}
 */
function sxToCssDeclarations(sx, theme) {
  if (!sx || typeof sx !== 'object') return '';
  const declarations = [];
  if (sx.backgroundColor != null) {
    const v = typeof sx.backgroundColor === 'function' ? sx.backgroundColor(theme) : sx.backgroundColor;
    if (v) declarations.push(`background-color: ${v}`);
  }
  if (sx.color != null) {
    const v = typeof sx.color === 'function' ? sx.color(theme) : sx.color;
    if (v) declarations.push(`color: ${v}`);
  }
  return declarations.join('; ');
}

/**
 * Subscribes to selectionStore and applies selection highlight via a scoped <style> tag.
 * Renders only the style tag, so row components do not re-render when selection changes
 * (enables single-click row select + open dropdown without closing).
 *
 * @param {Object} props
 * @param {string} props.tableId Stable id for the table element (e.g. useId())
 * @param {Set<string|number>} [props.selection] Multi-select set of row ids (checkbox selection)
 */
export function SelectionStyleApplicator({ tableId, selection }) {
  const ctx = useContext(DataGridStableContext);
  const theme = useTheme();
  const selectionStore = ctx?.selectionStore;
  const selectedRowStyle = ctx?.selectedRowStyle;

  const selectedRowId = useSyncExternalStore(
    selectionStore?.subscribe ?? (() => () => {}),
    () => selectionStore?.getSnapshot?.() ?? null,
    () => null
  );

  const css = useMemo(() => {
    const ids = new Set();
    if (selectedRowId != null && String(selectedRowId).length > 0) {
      ids.add(String(selectedRowId));
    }
    if (selection && selection.size > 0) {
      selection.forEach((id) => ids.add(String(id)));
    }
    if (ids.size === 0) return '';

    const prefix = `#${CSS.escape(tableId)} tbody `;
    const idSelectors = Array.from(ids)
      .map((id) => `${prefix}tr[data-row-id="${CSS.escape(id)}"]`)
      .join(',\n  ');
    const cellSelector = `${idSelectors} td`;

    const defaultBg = theme.palette?.action?.selected ?? SELECTED_ROW_BG;
    const declarations =
      sxToCssDeclarations(selectedRowStyle, theme) || `background-color: ${defaultBg}`;

    return `${cellSelector} {\n  ${declarations}\n}`;
  }, [tableId, selectedRowId, selection, selectedRowStyle, theme]);

  if (!css) return null;
  return <style data-grid-selection-highlight dangerouslySetInnerHTML={{ __html: css }} />;
}
