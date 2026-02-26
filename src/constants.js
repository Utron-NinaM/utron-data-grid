/**
 * Shared constants for the data grid (storage keys, defaults, input limits, layout).
 */

export const STORAGE_KEY_PREFIX = 'utron-datagrid';

export const DEFAULT_FONT_SIZE = 13;

export const MAX_TEXT_LENGTH = 500;
export const MAX_NUMBER_INPUT_LENGTH = 50;
export const MAX_LIST_FILTER_INPUT_LENGTH = 200;

// ─── Layout / Column ────────────────────────────────────────────────────────

export const CHECKBOX_COLUMN_WIDTH_PX = 48;
export const CONTAINER_WIDTH_FALLBACK_PX = 1000;
export const SCROLLBAR_BUFFER_PX = 2;
export const SCROLLBAR_TOLERANCE_PX = 1;
export const RESIZE_FALLBACK_WIDTH_PX = 100;

// ─── Column width ───────────────────────────────────────────────────────────

export const MIN_WIDTH_DEFAULT_PX = 110;
export const MIN_WIDTH_NO_FILTERS_PX = 85;

// ─── Column width estimation ────────────────────────────────────────────────

export const AVG_CHAR_WIDTH_PX = 8;
export const HEADER_CELL_PADDING_PX = 8;
export const ICON_ALLOWANCE_PX = 56;
export const ICON_ALLOWANCE_NO_FILTERS_PX = 46;
export const AUTO_MAX_WIDTH_MULTIPLIER = 2.5;

// ─── Header / Core styles ───────────────────────────────────────────────────

export const HEADER_STICKY_TOP_PX = 45;
export const SORT_LABEL_MIN_HEIGHT = 20;
export const SORT_LABEL_MIN_WIDTH = 22;
export const SORT_ORDER_BADGE_MIN_WIDTH = 20;
export const SORT_ORDER_BADGE_FONT_SIZE_REM = '0.75';
export const SORT_ORDER_BADGE_OPACITY = 0.8;
export const HEADER_CELL_PADDING = '4px';
export const RESIZE_HANDLE_WIDTH_PX = 8;
export const RESIZE_HANDLE_OFFSET_PX = -4;
export const RESIZE_LINE_WIDTH_PX = 2;
export const RESIZE_LINE_INSET_PX = 2;
export const RESIZE_LINE_TOP_PERCENT = '15%';
export const RESIZE_LINE_HEIGHT_PERCENT = '70%';
export const LUMINANCE_DARK_THRESHOLD = 0.3;
export const RESIZE_LINE_HOVER_ALPHA = 0.85;
export const DIVIDER_ALPHA = 0.1;
export const HEADER_Z_INDEX = 2;
export const TOOLTIP_OVER_HEADER_Z_INDEX = 3;

// ─── Filter ─────────────────────────────────────────────────────────────────

export const PADDING_INPUT_TOP_BOTTOM_PX = 4;
export const FILTER_OPERATOR_WIDTH_PX = 40;
export const FILTER_OPERATOR_WIDTH_PX_WITH_PADDING = FILTER_OPERATOR_WIDTH_PX + 6;
export const DEFAULT_FILTER_CONTENT_HEIGHT = 40;
export const FILTER_INPUT_HORIZONTAL_PADDING_PX = 8;
export const ICON_ARROW_SIZE_PX = 20;
export const ICON_OPERATOR_SIZE_PX = 18;
export const FILTER_TRANSITION_MS = 120;

// ─── Pagination / Default config ────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const BODY_ROW_HEIGHT = 30;
export const BODY_ROW_PADDING_VERTICAL_PX = 2;
export const BODY_ROW_PADDING_HORIZONTAL_PX = 4;