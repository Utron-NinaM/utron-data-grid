import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals';
import { faNotEqual } from '@fortawesome/free-solid-svg-icons/faNotEqual';
import { faGreaterThan } from '@fortawesome/free-solid-svg-icons/faGreaterThan';
import { faLessThan } from '@fortawesome/free-solid-svg-icons/faLessThan';
import { faGreaterThanEqual } from '@fortawesome/free-solid-svg-icons/faGreaterThanEqual';
import { faLessThanEqual } from '@fortawesome/free-solid-svg-icons/faLessThanEqual';
import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons/faArrowsLeftRight';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassMinus';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons/faFilterCircleXmark';
export { faFilterCircleXmark };

import { faClock } from '@fortawesome/free-regular-svg-icons/faClock';
import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons/faCircleCheck';

/**
 * Column definition shape (JSDoc for consumers).
 * field: string (key in row object)
 * headerName: string
 * width?: number | string (px or "20%")
 * minWidth?: number
 * type?: 'text' | 'number' | 'date' | 'datetime' | 'list'
 * filter?: 'text' | 'number' | 'date' | 'list' | 'none'
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

export const FILTER_TYPE_NONE = 'none';
export const FILTER_TYPE_TEXT = FIELD_TYPE_TEXT;
export const FILTER_TYPE_NUMBER = FIELD_TYPE_NUMBER;
export const FILTER_TYPE_DATE = FIELD_TYPE_DATE;
export const FILTER_TYPE_LIST = FIELD_TYPE_LIST;

// Default field type
export const DEFAULT_FIELD_TYPE = FIELD_TYPE_TEXT;

export const OPERATOR_EQUALS = 'operatorEquals';
export const OPERATOR_NOT_EQUAL = 'operatorNotEqual';
export const OPERATOR_GREATER_THAN = 'operatorGreaterThan';
export const OPERATOR_LESS_THAN = 'operatorLessThan';
export const OPERATOR_GREATER_OR_EQUAL = 'operatorGreaterOrEqual';
export const OPERATOR_LESS_OR_EQUAL = 'operatorLessOrEqual';
export const OPERATOR_IN_RANGE = 'operatorInRange';
export const OPERATOR_EMPTY = 'operatorEmpty';
export const OPERATOR_NOT_EMPTY = 'operatorNotEmpty';
export const OPERATOR_CONTAINS = 'operatorContains';
export const OPERATOR_NOT_CONTAINS = 'operatorNotContains';
export const OPERATOR_STARTS_WITH = 'operatorStartsWith';
export const OPERATOR_ENDS_WITH = 'operatorEndsWith';
export const OPERATOR_PERIOD = 'operatorPeriod';


/** Operator id → FontAwesome icon definition (for rendering). */
export const OPERATOR_ICONS = {
  [OPERATOR_EQUALS]: faEquals,
  [OPERATOR_NOT_EQUAL]: faNotEqual,
  [OPERATOR_GREATER_THAN]: faGreaterThan,
  [OPERATOR_LESS_THAN]: faLessThan,
  [OPERATOR_GREATER_OR_EQUAL]: faGreaterThanEqual,
  [OPERATOR_LESS_OR_EQUAL]: faLessThanEqual,
  [OPERATOR_IN_RANGE]: faArrowsLeftRight,
  [OPERATOR_EMPTY]: faCircle,
  [OPERATOR_NOT_EMPTY]: faCircleCheck,
  [OPERATOR_CONTAINS]: faMagnifyingGlass,
  [OPERATOR_NOT_CONTAINS]: faMagnifyingGlassMinus,
  [OPERATOR_STARTS_WITH]: faPlay,
  [OPERATOR_ENDS_WITH]: faStop,
  [OPERATOR_PERIOD]: faClock,
};

const DEFAULT_OP_IDS = [OPERATOR_EQUALS, OPERATOR_NOT_EQUAL, OPERATOR_EMPTY, OPERATOR_NOT_EMPTY];
export const NUMBER_OP_IDS = [...DEFAULT_OP_IDS, OPERATOR_GREATER_THAN, OPERATOR_LESS_THAN, OPERATOR_GREATER_OR_EQUAL, OPERATOR_LESS_OR_EQUAL, OPERATOR_IN_RANGE];
export const TEXT_OP_IDS = [...DEFAULT_OP_IDS, OPERATOR_CONTAINS, OPERATOR_NOT_CONTAINS, OPERATOR_STARTS_WITH, OPERATOR_ENDS_WITH];
export const DATE_OP_IDS = [...NUMBER_OP_IDS, OPERATOR_PERIOD];

// Sort Orders
export const SORT_ORDER_ASC = 'asc';
export const SORT_ORDER_DESC = 'desc';

// Alignments
export const ALIGN_LEFT = 'left';
export const ALIGN_RIGHT = 'right';
export const ALIGN_CENTER = 'center';

export const DIRECTION_LTR = 'ltr';
export const DIRECTION_RTL = 'rtl';

export const LOCALE_EN = 'en';
export const LOCALE_HE = 'he';
