/** Example column config with conditional editing rules */
/** Demonstrates column width system with fixed widths and constraints */

export const conditionalEditingColumns = [
  {
    field: 'name',
    headerName: 'Project Name',
    type: 'text',
    filter: 'text',
    editable: true, // Always editable
    width: 180,
    minWidth: 150,
    maxWidth: 300,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Project name is required';
          }
          if (value.length < 3) {
            return 'Project name must be at least 3 characters';
          }
          return true;
        },
        message: 'Project name is required and must be at least 3 characters',
      },
    ],
  },
  {
    field: 'status',
    headerName: 'Status',
    type: 'list',
    filter: 'list',
    editable: false, // Never editable (read-only)
    width: 120,
    options: ['Pending', 'In Progress', 'Completed', 'On Hold'],
    filterOptions: { listValues: ['Pending', 'In Progress', 'Completed', 'On Hold'] },
    cellStyle: (value, row) => {
      const colors = {
        'Pending': { backgroundColor: '#fff3e0' },
        'In Progress': { backgroundColor: '#e3f2fd' },
        'Completed': { backgroundColor: '#e8f5e9' },
        'On Hold': { backgroundColor: '#fce4ec' },
      };
      return colors[value] || {};
    },
  },
  {
    field: 'priority',
    headerName: 'Priority',
    type: 'list',
    filter: 'list',
    editable: (row) => row.status === 'Pending', // Only editable for pending projects
    width: 100,
    options: ['Low', 'Medium', 'High'],
    filterOptions: { listValues: ['Low', 'Medium', 'High'] },
    validators: [
      {
        validate: (value) => {
          if (!value) {
            return 'Priority is required';
          }
          return true;
        },
        message: 'Priority is required',
      },
    ],
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    type: 'text',
    filter: 'text',
    editable: (row) => row.status === 'Pending' || row.status === 'In Progress', // Editable for pending and in-progress
    width: 150,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Assigned to is required';
          }
          return true;
        },
        message: 'Assigned to is required',
      },
    ],
  },
  {
    field: 'notes',
    headerName: 'Notes',
    type: 'text',
    filter: 'text',
    editable: (row) => row.status === 'Pending', // Only editable for pending projects
    flex: 1, // Flexible width - grows to fill remaining space
    minWidth: 150,
    validators: [
      {
        validate: (value) => {
          if (value && value.length > 500) {
            return 'Notes cannot exceed 500 characters';
          }
          return true;
        },
        message: 'Notes cannot exceed 500 characters',
      },
    ],
  },
  {
    field: 'budget',
    headerName: 'Budget',
    type: 'number',
    filter: 'number',
    editable: (row) => row.status === 'Pending', // Only editable for pending projects
    width: 120,
    validators: [
      {
        validate: (value) => {
          if (value === undefined || value === null || value === '') {
            return 'Budget is required';
          }
          const num = Number(value);
          if (isNaN(num)) {
            return 'Budget must be a number';
          }
          if (num < 0) {
            return 'Budget cannot be negative';
          }
          if (num > 1000000) {
            return 'Budget cannot exceed 1,000,000';
          }
          return true;
        },
        message: 'Budget must be between 0 and 1,000,000',
      },
    ],
  },
];
