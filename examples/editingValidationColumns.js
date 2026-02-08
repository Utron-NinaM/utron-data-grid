/** Example column config with validation rules */

export const editingValidationColumns = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'text',
    filter: 'text',
    editable: true,
    width: 150,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Name is required';
          }
          if (value.length < 2) {
            return 'Name must be at least 2 characters';
          }
          return true;
        },
        message: 'Name is required and must be at least 2 characters',
      },
    ],
  },
  {
    field: 'email',
    headerName: 'Email',
    type: 'text',
    filter: 'text',
    editable: true,
    width: 200,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Email is required';
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Invalid email format';
          }
          return true;
        },
        message: 'Email is required and must be valid',
      },
    ],
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    filter: 'number',
    editable: true,
    width: 100,
    validators: [
      {
        validate: (value, row) => {
          if (value === undefined || value === null || value === '') {
            return 'Age is required';
          }
          const num = Number(value);
          if (isNaN(num)) {
            return 'Age must be a number';
          }
          if (num < 18) {
            return 'Age must be at least 18';
          }
          if (num > 120) {
            return 'Age must be less than 120';
          }
          return true;
        },
        message: 'Age must be between 18 and 120',
      },
    ],
  },
  {
    field: 'salary',
    headerName: 'Salary',
    type: 'number',
    filter: 'number',
    editable: true,
    width: 120,
    validators: [
      {
        validate: (value) => {
          if (value === undefined || value === null || value === '') {
            return 'Salary is required';
          }
          const num = Number(value);
          if (isNaN(num)) {
            return 'Salary must be a number';
          }
          if (num < 0) {
            return 'Salary cannot be negative';
          }
          if (num > 1000000) {
            return 'Salary cannot exceed 1,000,000';
          }
          return true;
        },
        message: 'Salary must be between 0 and 1,000,000',
      },
    ],
  },
  {
    field: 'department',
    headerName: 'Department',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 150,
    options: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
    filterOptions: { listValues: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] },
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Department is required';
          }
          return true;
        },
        message: 'Department is required',
      },
    ],
  },
  {
    field: 'status',
    headerName: 'Status',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 120,
    options: ['Active', 'Inactive', 'On Leave'],
    filterOptions: { listValues: ['Active', 'Inactive', 'On Leave'] },
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    type: 'date',
    filter: 'date',
    editable: true,
    width: 150,
    validators: [
      {
        validate: (value) => {
          if (!value) {
            return 'Start date is required';
          }
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date > today) {
            return 'Start date cannot be in the future';
          }
          return true;
        },
        message: 'Start date is required and cannot be in the future',
      },
    ],
  },
];
