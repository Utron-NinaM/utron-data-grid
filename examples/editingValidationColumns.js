/** Example column config with validation rules */
/** Demonstrates column width system with fixed widths and constraints */

const departments = ['הנדסה', 'מכירות', 'שיווק', 'משאבי אנוש', 'כספים', 'תפעול'];
const statuses = ['פעיל', 'לא פעיל', 'בחופשה'];

export const editingValidationColumns = [
  {
    field: 'name',
    headerName: 'שם',
    type: 'text',
    filter: 'text',
    editable: true,
    width: 150,
    minWidth: 120,
    maxWidth: 250,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'שם שדה חובה';
          }
          if (value.length < 2) {
            return 'השם חייב להכיל לפחות 2 תווים';
          }
          return true;
        },
        message: 'שם שדה חובה והשם חייב להכיל לפחות 2 תווים',
      },
    ],
  },
  {
    field: 'email',
    headerName: 'אימייל',
    type: 'text',
    filter: 'text',
    editable: true,
    width: 200,
    minWidth: 180,
    maxWidth: 350,
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'אימייל שדה חובה';
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'פורמט אימייל לא תקין';
          }
          return true;
        },
        message: 'אימייל שדה חובה וצריך להיות תקין',
      },
    ],
  },
  {
    field: 'age',
    headerName: 'גיל',
    type: 'number',
    filter: 'number',
    editable: true,
    width: 100,
    validators: [
      {
        validate: (value, row) => {
          if (value === undefined || value === null || value === '') {
            return 'גיל שדה חובה';
          }
          const num = Number(value);
          if (isNaN(num)) {
            return 'גיל חייב להיות מספר';
          }
          if (num < 18) {
            return 'גיל חייב להיות לפחות 18';
          }
          if (num > 120) {
            return 'גיל חייב להיות פחות מ-120';
          }
          return true;
        },
        message: 'גיל חייב להיות בין 18 ל-120',
      },
    ],
  },
  {
    field: 'salary',
    headerName: 'משכורת',
    type: 'number',
    filter: 'number',
    editable: true,
    width: 120,
    validators: [
      {
        validate: (value) => {
          if (value === undefined || value === null || value === '') {
            return 'משכורת שדה חובה';
          }
          const num = Number(value);
          if (isNaN(num)) {
            return 'משכורת חייבת להיות מספר';
          }
          if (num < 0) {
            return 'משכורת לא יכולה להיות שלילית';
          }
          if (num > 1000000) {
            return 'משכורת לא יכולה לעלות על 1,000,000';
          }
          return true;
        },
        message: 'משכורת חייבת להיות בין 0 ל-1,000,000',
      },
    ],
  },
  {
    field: 'department',
    headerName: 'מחלקה',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 150,
    options: departments,
    filterOptions: { listValues: departments },
    validators: [
      {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'מחלקה שדה חובה';
          }
          return true;
        },
        message: 'מחלקה שדה חובה',
      },
    ],
  },
  {
    field: 'status',
    headerName: 'סטטוס',
    type: 'list',
    filter: 'list',
    editable: true,
    width: 120,
    options: statuses,
    filterOptions: { listValues: statuses },
  },
  {
    field: 'startDate',
    headerName: 'תאריך התחלה',
    type: 'date',
    filter: 'date',
    editable: true,
    width: 150,
    validators: [
      {
        validate: (value) => {
          if (!value) {
            return 'תאריך התחלה שדה חובה';
          }
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date > today) {
            return 'תאריך התחלה לא יכול להיות בעתיד';
          }
          return true;
        },
        message: 'תאריך התחלה שדה חובה ולא יכול להיות בעתיד',
      },
    ],
  },
];
