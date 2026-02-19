import { DIRECTION_RTL } from '../config/schema';

// ----- GridTable -----

export function getToolbarBoxSx(containScroll) {
  return {
    ...(containScroll ? {} : { position: 'sticky', top: 0, zIndex: 3 }),
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    py: 0.5,
    pb: 1.5,
    backgroundColor: 'background.paper',
  };
}

export const toolbarActionsBoxSx = { display: 'flex', gap: 1 };

export function getTableContainerSx(enableHorizontalScroll, totalWidth) {
  return {
    overflowX: enableHorizontalScroll ? 'scroll' : 'visible',
    overflowY: 'visible',
    width: '100%',
    ...(totalWidth && enableHorizontalScroll && { minWidth: `${totalWidth}px` }),
    borderRight: 'none',
    borderLeft: 'none',
  };
}

export function getTableSx(totalWidth, enableHorizontalScroll) {
  return {
    width: '100%',
    tableLayout: 'fixed',
    ...(totalWidth && enableHorizontalScroll && { minWidth: `${totalWidth}px` }),
  };
}

export function getTableHeadSx(containScroll, headerConfig) {
  return {
    ...headerConfig?.base,
    position: 'sticky',
    top: containScroll ? 0 : 45,
    zIndex: 2,
    backgroundColor: headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper',
  };
}

export function getMainHeaderRowSx(headerConfig, hasFilterRow) {
  return {
    ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
    ...(hasFilterRow && { '& .MuiTableCell-root': { borderBottom: 'none' } }),
  };
}

export function getHeaderCheckboxCellSx(headerConfig, rowType = 'mainRow') {
  const bgKey = rowType === 'filterRows' ? 'filterRows' : 'mainRow';
  return {
    ...headerConfig?.base,
    backgroundColor: headerConfig?.[bgKey]?.backgroundColor || headerConfig?.base?.backgroundColor || 'inherit',
  };
}

export function getFilterRowSx(headerConfig) {
  return {
    backgroundColor: headerConfig?.filterRows?.backgroundColor ?? headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper',
  };
}

export const scrollContainerSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
};

export function getScrollInnerBoxSx(enableHorizontalScroll) {
  return {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    overflow: 'auto',
    overflowX: enableHorizontalScroll ? 'scroll' : 'auto',
  };
}

// ----- GridCell -----

export const truncationSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  minWidth: 0,
};

export const cellContentWrapperSx = { display: 'block', width: '100%', minWidth: 0 };

// ----- GridHeaderCell -----

export const headerCellBaseSx = { paddingLeft: '4px', paddingRight: '4px', position: 'relative' };

export function getHeaderInnerBoxSx(mainRowHeight, headerComboSlot) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: headerComboSlot ? 'nowrap' : 'wrap',
    py: mainRowHeight ? 0 : 0.5,
    boxSizing: 'border-box',
    height: '100%',
  };
}

export const sortLabelSx = { minHeight: 20, minWidth: 0, overflow: 'hidden', flexShrink: 0 };

export const headerLabelSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  width: '100%',
};

export const sortOrderBadgeSx = { ml: 0.25, fontSize: '0.75rem', opacity: 0.8, flexShrink: 0 };

export const flexSpacerSx = { flex: 1, minWidth: 0 };

export function getResizeHandleSx(direction) {
  return {
    position: 'absolute',
    top: 0,
    ...(direction === DIRECTION_RTL ? { left: '-3px' } : { right: '-3px' }),
    width: '8px',
    height: '100%',
    cursor: 'col-resize',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  };
}
