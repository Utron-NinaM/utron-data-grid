/** Example column config: cars (Make, Model, Price, Year, Color, Electric, Status, Date) */
/** List columns use { value, label }; row data and filter persistence use the same keys. */
import { FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST } from '../src/config/schema';

const colorOptionsEn = [
  { value: 'white', label: 'White' }, { value: 'black', label: 'Black' }, { value: 'red', label: 'Red' },
  { value: 'silver', label: 'Silver' }, { value: 'blue', label: 'Blue' }, { value: 'green', label: 'Green' },
  { value: 'gray', label: 'Gray' }, { value: 'pearl', label: 'Pearl' }, { value: 'bronze', label: 'Bronze' }, { value: 'navy', label: 'Navy' },
];
const colorOptionsHe = [
  { value: 'white', label: 'לבן' }, { value: 'black', label: 'שחור' }, { value: 'red', label: 'אדום' },
  { value: 'silver', label: 'כסף' }, { value: 'blue', label: 'כחול' }, { value: 'green', label: 'ירוק' },
  { value: 'gray', label: 'אפור' }, { value: 'pearl', label: 'פנינה' }, { value: 'bronze', label: 'ברונזה' }, { value: 'navy', label: 'כחול כהה' },
];
const electricOptionsEn = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
const electricOptionsHe = [{ value: 'yes', label: 'כן' }, { value: 'no', label: 'לא' }];
const statusOptionsEn = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }];
const statusOptionsHe = [{ value: 'active', label: 'פעיל' }, { value: 'inactive', label: 'לא פעיל' }, { value: 'pending', label: 'ממתין' }];

export const columnsConfig = [
  { field: 'make', headerName: 'Make', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 50 },
  { field: 'model', headerName: 'Model', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 200, minWidth: 150, maxWidth: 300, cellStyle: { fontSize: '20px' } },
  { field: 'price', headerName: 'Price', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, flex: 1 },
  { field: 'year', headerName: 'Year', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, flex: 2 },
  {
    field: 'color',
    headerName: 'Color',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: colorOptionsEn,
    filterOptions: { listValues: colorOptionsEn },
  },
  {
    field: 'electric',
    headerName: 'Electric',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 90,
    options: electricOptionsEn,
    filterOptions: { listValues: electricOptionsEn },
    cellStyle: (value, row) => (value === 'yes' ? { backgroundColor: '#e8f5e9' } : {}),
  },
  { field: 'createdAt', headerName: 'Date', type: FIELD_TYPE_DATETIME, filter: FIELD_TYPE_DATE, editable: true, width: 120 },
  {
    field: 'status',
    headerName: 'Status',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    minWidth: 80,
    maxWidth: 150,
    options: statusOptionsEn,
    filterOptions: { listValues: statusOptionsEn },
    rowStyle: (row) => (row.status === 'pending' ? { backgroundColor: '#fff3e0' } : {}),
  },
  { field: 'description', headerName: 'Description', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, flex: 1, minWidth: 150 },
];

export const columnsConfigHebrew = [
  { field: 'make', headerName: 'יצרן', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 120 },
  { field: 'model', headerName: 'דגם', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 120 },
  { field: 'price', headerName: 'מחיר', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, width: 100 },
  { field: 'year', headerName: 'שנה', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, width: 80 },
  {
    field: 'color',
    headerName: 'צבע',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: colorOptionsHe,
    filterOptions: { listValues: colorOptionsHe },
  },
  {
    field: 'electric',
    headerName: 'חשמלי',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 90,
    options: electricOptionsHe,
    filterOptions: { listValues: electricOptionsHe },
    cellStyle: (value, row) => (value === 'yes' ? { backgroundColor: '#e8f5e9' } : {}),
  },
  {
    field: 'status',
    headerName: 'סטטוס',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: statusOptionsHe,
    filterOptions: { listValues: statusOptionsHe },
    rowStyle: (row) => (row.status === 'pending' ? { backgroundColor: '#fff3e0' } : {}),
  },
  { field: 'createdAt', headerName: 'תאריך', type: FIELD_TYPE_DATE, filter: FIELD_TYPE_DATE, editable: true, width: 120 },
  { field: 'description', headerName: 'תיאור', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, flex: 1, minWidth: 150 },
];
