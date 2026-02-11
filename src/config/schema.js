/**
 * Column definition shape (JSDoc for consumers).
 * field: string (key in row object)
 * headerName: string
 * width?: number | string (px or "20%")
 * minWidth?: number
 * type?: 'text' | 'number' | 'date' | 'datetime' | 'list'
 * filter?: 'text' | 'number' | 'date' | 'datetime' | 'list' | false
 * filterOptions?: { listValues?: any[] }
 * editable?: boolean | ((row) => boolean)
 * validators?: Array<{ validate: (value, row) => boolean|string, message?: string }>
 * options?: any[] (for list)
 * render?: (value, row) => ReactNode — must not return unsanitized HTML or use dangerouslySetInnerHTML with user/API data (React escapes by default).
 * rowStyle?: (row) => sx
 * cellStyle?: (value, row) => sx
 * align?: 'left' | 'right' | 'center'
 */

// Field/Column Types
export const FIELD_TYPE_TEXT = 'text';
export const FIELD_TYPE_NUMBER = 'number';
export const FIELD_TYPE_DATE = 'date';
export const FIELD_TYPE_DATETIME = 'datetime';
export const FIELD_TYPE_LIST = 'list';

export const COLUMN_TYPES = [FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST];
export const FILTER_TYPES = [FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST];

// Default field type
export const DEFAULT_FIELD_TYPE = FIELD_TYPE_TEXT;

// Operators
export const OPERATOR_EQUALS = '=';
export const OPERATOR_NOT_EQUAL = '!=';
export const OPERATOR_GREATER_THAN = '>';
export const OPERATOR_LESS_THAN = '<';
export const OPERATOR_GREATER_OR_EQUAL = '>=';
export const OPERATOR_LESS_OR_EQUAL = '<=';
export const OPERATOR_IN_RANGE = 'inRange';

export const OPERATORS = [
  OPERATOR_EQUALS,
  OPERATOR_NOT_EQUAL,
  OPERATOR_GREATER_THAN,
  OPERATOR_LESS_THAN,
  OPERATOR_GREATER_OR_EQUAL,
  OPERATOR_LESS_OR_EQUAL,
  OPERATOR_IN_RANGE,
];

export const OPERATOR_MAP = {
  [OPERATOR_EQUALS]: 'operatorEquals',
  [OPERATOR_NOT_EQUAL]: 'operatorNotEqual',
  [OPERATOR_GREATER_THAN]: 'operatorGreaterThan',
  [OPERATOR_LESS_THAN]: 'operatorLessThan',
  [OPERATOR_GREATER_OR_EQUAL]: 'operatorGreaterOrEqual',
  [OPERATOR_LESS_OR_EQUAL]: 'operatorLessOrEqual',
  [OPERATOR_IN_RANGE]: 'operatorInRange',
};

// Sort Orders
export const SORT_ORDER_ASC = 'asc';
export const SORT_ORDER_DESC = 'desc';

// Alignments
export const ALIGN_LEFT = 'left';
export const ALIGN_RIGHT = 'right';
export const ALIGN_CENTER = 'center';
