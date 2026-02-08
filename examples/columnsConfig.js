/** Example column config: cars (Make, Model, Price, Year, Color, Electric, Status, Date) */

export const columnsConfig = [
  { field: 'make', headerName: 'Make', type: 'text', filter: 'text', editable: true, width: 120 },
  { field: 'model', headerName: 'Model', type: 'text', filter: 'text', editable: true, width: 120 },
  { field: 'price', headerName: 'Price', type: 'number', filter: 'number', editable: true, width: 100 },
  { field: 'year', headerName: 'Year', type: 'number', filter: 'number', editable: true, width: 80 },
  {
    field: 'color',
    headerName: 'Color',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 100,
    options: ['Black', 'White', 'Silver', 'Red', 'Blue', 'Green'],
    filterOptions: { listValues: ['Black', 'White', 'Silver', 'Red', 'Blue', 'Green'] },
  },
  {
    field: 'electric',
    headerName: 'Electric',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 90,
    options: ['Yes', 'No'],
    filterOptions: { listValues: ['Yes', 'No'] },
  },
  {
    field: 'status',
    headerName: 'Status',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 100,
    options: ['Active', 'Inactive', 'Pending'],
    filterOptions: { listValues: ['Active', 'Inactive', 'Pending'] },
  },
  { field: 'date', headerName: 'Date', type: 'date', filter: 'date', editable: true, width: 120 },
];
