/** Example column config: cars (Make, Model, Price, Year, Color, Electric, Status, Date) */
/** Demonstrates column width system: fixed widths, flex, minWidth, maxWidth, and auto-sizing */
import { FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST } from '../src/config/schema';

export const columnsConfig = [
  // Fixed width column
  { field: 'make', headerName: 'Make', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 50 },
  
  // Fixed width with constraints
  { field: 'model', headerName: 'Model', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 200, minWidth: 150, maxWidth: 300, cellStyle: { fontSize: '20px' } },
  
  // Fixed width column
  { field: 'price', headerName: 'Price', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, flex: 1 },
  
  // Fixed width column
  { field: 'year', headerName: 'Year', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, flex: 2 },
  
  // Fixed width column
  {
    field: 'color',
    headerName: 'Color',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: ['White', 'Black', 'Red', 'Silver', 'Blue', 'Green', 'Gray', 'Pearl', 'Bronze', 'Navy'],
    filterOptions: { listValues: ['White', 'Black', 'Red', 'Silver', 'Blue', 'Green', 'Gray', 'Pearl', 'Bronze', 'Navy'] },
  },
  
  // Fixed width column
  {
    field: 'electric',
    headerName: 'Electric',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 90,
    options: ['Yes', 'No'],
    filterOptions: { listValues: ['Yes', 'No'] },
    cellStyle: (value, row) => (value === 'Yes' ? { backgroundColor: '#e8f5e9' } : {}),
  },
  
  // Fixed width column
  { field: 'createdAt', headerName: 'Date', type: FIELD_TYPE_DATETIME, filter: FIELD_TYPE_DATE, editable: true, width: 120 },
  
  // Fixed width column with constraints
  {
    field: 'status',
    headerName: 'Status',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    minWidth: 80,
    maxWidth: 150,
    options: ['Active', 'Inactive', 'Pending'],
    filterOptions: { listValues: ['Active', 'Inactive', 'Pending'] },
    rowStyle: (row) => (row.status === 'Pending' ? { backgroundColor: '#fff3e0' } : {}),    
  },
  
  // Flexible width column (grows proportionally to fill remaining space)
  { field: 'description', headerName: 'Description', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, flex: 1, minWidth: 150 },
];

export const columnsConfigHebrew = [
  { field: 'make', headerName: 'יצרן', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 120 },
  { field: 'model', headerName: 'דגם', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, width: 120 },
  { field: 'price', headerName: 'מחיר', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, width: 100 },
  { field: 'year', headerName: 'שנה', type: FIELD_TYPE_NUMBER, filter: FIELD_TYPE_NUMBER, editable: true, width: 80 },
  {
    field: 'colorHebrew',
    headerName: 'צבע',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: ['שחור', 'לבן', 'כסף', 'אדום', 'כחול', 'ירוק'],
    filterOptions: { listValues: ['שחור', 'לבן', 'כסף', 'אדום', 'כחול', 'ירוק'] },
  },
  {
    field: 'electricHebrew',
    headerName: 'חשמלי',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 90,
    options: ['כן', 'לא'],
    filterOptions: { listValues: ['כן', 'לא'] },
    cellStyle: (value, row) => (value === 'כן' ? { backgroundColor: '#e8f5e9' } : {}),
  },
  {
    field: 'statusHebrew',
    headerName: 'סטטוס',
    type: FIELD_TYPE_LIST,
    filter: FIELD_TYPE_LIST,
    editable: true,
    width: 100,
    options: ['פעיל', 'לא פעיל', 'ממתין'],
    filterOptions: { listValues: ['פעיל', 'לא פעיל', 'ממתין'] },
    rowStyle: (row) => (row.statusHebrew === 'ממתין' ? { backgroundColor: '#fff3e0' } : {}),
  },
  { field: 'createdAt', headerName: 'תאריך', type: FIELD_TYPE_DATE, filter: FIELD_TYPE_DATE, editable: true, width: 120 },
  // Flexible width column (grows proportionally)
  { field: 'descriptionHebrew', headerName: 'תיאור', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT, editable: true, flex: 1, minWidth: 150 },  
];