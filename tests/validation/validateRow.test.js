import { describe, it, expect } from 'vitest';
import { validateRow } from '../../src/validation/validateRow';

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
          validators: [{ validate: () => false, message: 'Score must be positive' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        { field: 'score', message: 'Score must be positive' },
      ]);
    });

    it('returns one error with default "Invalid" when validator returns false and no message', () => {
      const row = { id: 1, score: -1 };
      const columns = [
        {
          field: 'score',
          validators: [{ validate: () => false }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        { field: 'score', message: 'Invalid' },
      ]);
    });

    it('returns one error with validator return string when validator returns non-empty string', () => {
      const row = { id: 1, email: 'bad' };
      const columns = [
        {
          field: 'email',
          validators: [
            {
              validate: (v) => (v.includes('@') ? true : 'Enter a valid email'),
              message: 'Invalid',
            },
          ],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        { field: 'email', message: 'Enter a valid email' },
      ]);
    });

    it('returns [] when validator returns true', () => {
      const row = { id: 1, score: 10 };
      const columns = [
        {
          field: 'score',
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
          validators: [{ validate: (v) => (v && v.length > 0) || false, message: 'Name required' }],
        },
        {
          field: 'score',
          validators: [{ validate: (v) => v >= 0, message: 'Score must be >= 0' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual(
        expect.arrayContaining([
          { field: 'name', message: 'Name required' },
          { field: 'score', message: 'Score must be >= 0' },
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
          validators: [{ validate: (v) => v >= 0, message: 'Invalid score' }],
        },
      ];
      expect(validateRow(row, columns, row)).toEqual([
        { field: 'score', message: 'Invalid score' },
      ]);
    });
  });

  describe('row passed to validator', () => {
    it('passes row as second argument to validate(value, row)', () => {
      const row = { id: 1, min: 10, max: 20 };
      const columns = [
        {
          field: 'max',
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
        { field: 'max', message: 'Max must be >= min' },
      ]);
    });
  });

  describe('conditional editing', () => {
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
      expect(result).toEqual([{ field: 'name', message: 'Name required' }]);
    });

    it('validates conditionally editable columns when function returns true', () => {
      const row = { id: 1, notes: '', status: 'Pending' };
      const originalRow = { id: 1, notes: '', status: 'Pending' };
      const columns = [
        {
          field: 'notes',
          editable: (r) => r.status === 'Pending',
          validators: [{ validate: (v) => v.length > 0 || 'Notes required' }],
        },
      ];
      const result = validateRow(row, columns, originalRow);
      expect(result).toEqual([{ field: 'notes', message: 'Notes required' }]);
    });

    it('skips validation for conditionally editable columns when function returns false', () => {
      const row = { id: 1, notes: '', status: 'Completed' };
      const originalRow = { id: 1, notes: '', status: 'Completed' };
      const columns = [
        {
          field: 'notes',
          editable: (r) => r.status === 'Pending',
          validators: [{ validate: (v) => v.length > 0 || 'Notes required' }],
        },
      ];
      const result = validateRow(row, columns, originalRow);
      // Notes should not be validated (not editable for Completed status)
      expect(result).toEqual([]);
    });

    it('handles mixed editable types (boolean and function)', () => {
      const row = { id: 1, name: '', priority: 'Low', status: 'Pending' };
      const originalRow = { id: 1, name: '', priority: 'Low', status: 'Pending' };
      const columns = [
        {
          field: 'name',
          editable: true,
          validators: [{ validate: (v) => v.length > 0 || 'Name required' }],
        },
        {
          field: 'priority',
          editable: (r) => r.status === 'Pending',
          validators: [{ validate: (v) => v !== 'Low' || 'Priority too low' }],
        },
        {
          field: 'status',
          editable: false,
          validators: [{ validate: () => false || 'Should not validate' }],
        },
      ];
      const result = validateRow(row, columns, originalRow);
      // name and priority should be validated, status should not
      expect(result).toEqual([
        { field: 'name', message: 'Name required' },
        { field: 'priority', message: 'Priority too low' },
      ]);
    });
  });
});
