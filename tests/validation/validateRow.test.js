import { describe, it, expect } from 'vitest';
import { validateRow, validateField } from '../../src/validation/validateRow';

const err = (field, message) => ({ field, message, severity: 'error' });

describe('validateRow', () => {
  describe('no validators', () => {
    it('returns [] when columns have no validators', () => {
      const row = { id: 1, name: 'Alice' };
      const columns = [{ field: 'name', headerName: 'Name' }];
      expect(validateRow(row, columns, row)).toEqual([]);
    });

    it('returns [] when validators is empty array', () => {
      const row = { id: 1, name: 'Alice' };
      const columns = [{ field: 'name', headerName: 'Name', validators: [] }];
      expect(validateRow(row, columns, row)).toEqual([]);
    });

    it('skips column when validators is missing', () => {
      const row = { id: 1, name: 'Alice' };
      const columns = [{ field: 'name', headerName: 'Name' }];
      expect(validateRow(row, columns, row)).toEqual([]);
    });
  });

  describe('single validator', () => {
    it('returns one error with column message when validator returns false', () => {
      const row = { id: 1, score: -1 };
      const columns = [
        {
          field: 'score',
          editable: true,
          validators: [{ validate: () => false, message: 'Score must be positive' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        err('score', 'Score must be positive'),
      ]);
    });

    it('returns one error with default "Invalid" when validator returns false and no message', () => {
      const row = { id: 1, score: -1 };
      const columns = [
        {
          field: 'score',
          editable: true,
          validators: [{ validate: () => false }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        err('score', 'Invalid'),
      ]);
    });

    it('returns one error with validator return string when validator returns non-empty string', () => {
      const row = { id: 1, email: 'bad' };
      const columns = [
        {
          field: 'email',
          editable: true,
          validators: [
            {
              validate: (v) => (v.includes('@') ? true : 'Enter a valid email'),
              message: 'Invalid',
            },
          ],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        err('email', 'Enter a valid email'),
      ]);
    });

    it('returns [] when validator returns true', () => {
      const row = { id: 1, score: 10 };
      const columns = [
        {
          field: 'score',
          editable: true,
          validators: [{ validate: (v) => v > 0, message: 'Must be positive' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([]);
    });

    it('returns [] when validator returns empty string', () => {
      const row = { id: 1, name: 'Alice' };
      const columns = [
        {
          field: 'name',
          editable: true,
          validators: [{ validate: () => '', message: 'Required' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([]);
    });
  });

  describe('multiple validators on same column', () => {
    it('first failing validator wins, then breaks', () => {
      const row = { id: 1, score: -5 };
      const columns = [
        {
          field: 'score',
          editable: true,
          validators: [
            { validate: (v) => v >= 0, message: 'Non-negative' },
            { validate: (v) => v <= 100, message: 'At most 100' },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('Non-negative');
    });

    it('second validator error used when first passes', () => {
      const row = { id: 1, score: 150 };
      const columns = [
        {
          field: 'score',
          editable: true,
          validators: [
            { validate: (v) => v >= 0, message: 'Non-negative' },
            { validate: (v) => v <= 100, message: 'At most 100' },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('At most 100');
    });
  });

  describe('multiple columns', () => {
    it('collects errors from each column', () => {
      const row = { id: 1, name: '', score: -1 };
      const columns = [
        {
          field: 'name',
          editable: true,
          validators: [{ validate: (v) => (v && v.length > 0) || false, message: 'Name required' }],
        },
        {
          field: 'score',
          editable: true,
          validators: [{ validate: (v) => v >= 0, message: 'Score must be >= 0' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual(
        expect.arrayContaining([
          err('name', 'Name required'),
          err('score', 'Score must be >= 0'),
        ])
      );
      expect(validateRow(row, columns, row)).toHaveLength(2);
    });

    it('skips columns without validators and validates others', () => {
      const row = { id: 1, name: 'A', score: -1 };
      const columns = [
        { field: 'id' },
        {
          field: 'score',
          editable: true,
          validators: [{ validate: (v) => v >= 0, message: 'Invalid score' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        err('score', 'Invalid score'),
      ]);
    });
  });

  describe('row passed to validator', () => {
    it('passes row as second argument to validate(value, row)', () => {
      const row = { id: 1, min: 10, max: 20 };
      const columns = [
        {
          field: 'max',
          editable: true,
          validators: [
            {
              validate: (value, r) => value >= r.min,
              message: 'Max must be >= min',
            },
          ],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([]);
      const badRow = { id: 2, min: 20, max: 10 };
      expect(validateRow(badRow, columns, badRow)).toEqual([
        err('max', 'Max must be >= min'),
      ]);
    });
  });

  describe('editable and addable properties', () => {
    it('skips validation for non-editable columns', () => {
      const row = { id: 1, name: '', status: 'Completed' };
      const originalRow = { id: 1, name: '', status: 'Completed' };
      const columns = [
        {
          field: 'name',
          editable: true,
          validators: [{ validate: (v) => v.length > 0 || 'Name required' }],
        },
        {
          field: 'status',
          editable: false,
          validators: [{ validate: (v) => v === 'Pending' || 'Must be Pending' }],
        },
      ];
      const result = validateRow(row, columns, originalRow);
      // Only name should be validated (status is not editable)
      expect(result).toEqual([err('name', 'Name required')]);
    });

    it('validates editable columns in update mode', () => {
      const row = { id: 1, notes: '' };
      const originalRow = { id: 1, notes: '' };
      const columns = [
        {
          field: 'notes',
          editable: true,
          validators: [{ validate: (v) => v.length > 0 || 'Notes required' }],
        },
      ];
      const result = validateRow(row, columns, originalRow, 'update');
      expect(result).toEqual([err('notes', 'Notes required')]);
    });

    it('validates addable columns in create mode', () => {
      const row = { id: 1, notes: '' };
      const originalRow = null;
      const columns = [
        {
          field: 'notes',
          editable: false,
          addable: true,
          validators: [{ validate: (v) => v.length > 0 || 'Notes required' }],
        },
      ];
      const result = validateRow(row, columns, originalRow, 'create');
      expect(result).toEqual([err('notes', 'Notes required')]);
    });

    it('skips validation for non-editable and non-addable columns in create mode', () => {
      const row = { id: 1, notes: '' };
      const originalRow = null;
      const columns = [
        {
          field: 'notes',
          editable: false,
          addable: false,
          validators: [{ validate: (v) => v.length > 0 || 'Notes required' }],
        },
      ];
      const result = validateRow(row, columns, originalRow, 'create');
      // Notes should not be validated (not editable or addable)
      expect(result).toEqual([]);
    });

    it('validates editable columns in create mode even if addable is false', () => {
      const row = { id: 1, name: '', priority: 'Low' };
      const originalRow = null;
      const columns = [
        {
          field: 'name',
          editable: true,
          addable: false,
          validators: [{ validate: (v) => v.length > 0 || 'Name required' }],
        },
        {
          field: 'priority',
          editable: true,
          addable: true,
          validators: [{ validate: (v) => v !== 'Low' || 'Priority too low' }],
        },
        {
          field: 'status',
          editable: false,
          addable: false,
          validators: [{ validate: () => false || 'Should not validate' }],
        },
      ];
      const result = validateRow(row, columns, originalRow, 'create');
      // name and priority should be validated (both editable or addable), status should not
      expect(result).toEqual([
        err('name', 'Name required'),
        err('priority', 'Priority too low'),
      ]);
    });
  });

  describe('row-level validation', () => {
    it('returns row-level error (field: null) when validator has rowLevel: true', () => {
      const row = { id: 1, price: 60000, year: 1999 };
      const columns = [
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (_value, r) => {
                if (r.price > 50000 && r.year < 2000) {
                  return 'Expensive cars must be from year 2000 or later';
                }
                return true;
              },
              message: 'Row validation failed',
              rowLevel: true,
            },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toEqual([
        { field: null, message: 'Expensive cars must be from year 2000 or later', severity: 'error' },
      ]);
    });

    it('returns field-level error when rowLevel is not set (default behavior)', () => {
      const row = { id: 1, price: -100 };
      const columns = [
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (v) => v >= 0,
              message: 'Price must be >= 0',
              // rowLevel not set - should default to field-level
            },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toEqual([
        { field: 'price', message: 'Price must be >= 0', severity: 'error' },
      ]);
    });

    it('handles mixed field-level and row-level validators on same column', () => {
      const row = { id: 1, price: 60000, year: 1999 };
      const columns = [
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (v) => v >= 0,
              message: 'Price must be >= 0',
            },
            {
              validate: (_value, r) => {
                if (r.price > 50000 && r.year < 2000) {
                  return 'Expensive cars must be from year 2000 or later';
                }
                return true;
              },
              message: 'Row validation failed',
              rowLevel: true,
            },
          ],
        },
      ];
      // First validator passes (price >= 0), second fails (row-level)
      const result = validateRow(row, columns, row);
      expect(result).toEqual([
        { field: null, message: 'Expensive cars must be from year 2000 or later', severity: 'error' },
      ]);
    });

    it('handles row-level validator that returns object with field: null', () => {
      const row = { id: 1, price: 60000, year: 1999 };
      const columns = [
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (_value, r) => {
                if (r.price > 50000 && r.year < 2000) {
                  return { field: null, message: 'Expensive cars must be from year 2000 or later' };
                }
                return true;
              },
              message: 'Row validation failed',
            },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toEqual([
        { field: null, message: 'Expensive cars must be from year 2000 or later', severity: 'error' },
      ]);
    });

    it('returns both field-level and row-level errors from different columns', () => {
      const row = { id: 1, name: '', price: 60000, year: 1999 };
      const columns = [
        {
          field: 'name',
          editable: true,
          validators: [{ validate: (v) => v.length > 0, message: 'Name required' }],
        },
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (_value, r) => {
                if (r.price > 50000 && r.year < 2000) {
                  return 'Expensive cars must be from year 2000 or later';
                }
                return true;
              },
              message: 'Row validation failed',
              rowLevel: true,
            },
          ],
        },
      ];
      const result = validateRow(row, columns, row);
      expect(result).toEqual(
        expect.arrayContaining([
          { field: 'name', message: 'Name required', severity: 'error' },
          { field: null, message: 'Expensive cars must be from year 2000 or later', severity: 'error' },
        ])
      );
      expect(result).toHaveLength(2);
    });

    it('returns [] when row-level validator passes', () => {
      const row = { id: 1, price: 60000, year: 2000 };
      const columns = [
        {
          field: 'price',
          editable: true,
          validators: [
            {
              validate: (_value, r) => {
                if (r.price > 50000 && r.year < 2000) {
                  return 'Expensive cars must be from year 2000 or later';
                }
                return true;
              },
              message: 'Row validation failed',
              rowLevel: true,
            },
          ],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([]);
    });
  });

  describe('validateField', () => {
    it('returns [] when column has no validators', () => {
      const row = { id: 1, name: 'Alice' };
      const columns = [{ field: 'name', headerName: 'Name' }];
      expect(validateField(row, columns, row, 'name')).toEqual([]);
    });

    it('returns errors for the given field only', () => {
      const row = { id: 1, score: -1, name: 'A' };
      const columns = [
        { field: 'name', editable: true, validators: [{ validate: (v) => v.length > 1, message: 'Too short' }] },
        { field: 'score', editable: true, validators: [{ validate: (v) => v >= 0, message: 'Score must be >= 0' }] },
      ];
      expect(validateField(row, columns, row, 'score')).toEqual([
        err('score', 'Score must be >= 0'),
      ]);
      expect(validateField(row, columns, row, 'name')).toEqual([
        err('name', 'Too short'),
      ]);
    });

    it('returns [] when field is valid', () => {
      const row = { id: 1, score: 10 };
      const columns = [
        { field: 'score', editable: true, validators: [{ validate: (v) => v >= 0, message: 'Invalid' }] },
      ];
      expect(validateField(row, columns, row, 'score')).toEqual([]);
    });

    it('respects editable and addable properties for originalRow', () => {
      const row = { id: 1, notes: '' };
      const originalRow = { id: 1, notes: '', status: 'Completed' };
      const columns = [
        {
          field: 'notes',
          editable: false,
          addable: false,
          validators: [{ validate: (v) => v.length > 0, message: 'Required' }],
        },
      ];
      expect(validateField(row, columns, originalRow, 'notes')).toEqual([]);
    });
  });
});
