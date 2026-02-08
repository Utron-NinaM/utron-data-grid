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
 * render?: (value, row) => ReactNode
 * rowStyle?: (row) => sx
 * cellStyle?: (value, row) => sx
 * align?: 'left' | 'right' | 'center'
 */

export const COLUMN_TYPES = ['text', 'number', 'date', 'datetime', 'list'];
export const FILTER_TYPES = ['text', 'number', 'date', 'datetime', 'list'];
export const NUMBER_OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'inRange'];
export const DATE_OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'inRange'];
