import { describe, it, expect } from 'vitest';
import { createEditStore, toRowErrors } from '../../src/DataGrid/editStore';

describe('editStore', () => {
  describe('toRowErrors', () => {
    it('returns empty object when errors array is empty', () => {
      expect(toRowErrors('1', [])).toEqual({});
    });

    it('returns empty object when errors is null or undefined', () => {
      expect(toRowErrors('1', null)).toEqual({});
      expect(toRowErrors('1', undefined)).toEqual({});
    });

    it('groups errors by field', () => {
      const errors = [
        { field: 'name', message: 'Name required', severity: 'error' },
        { field: 'age', message: 'Age required', severity: 'error' },
      ];
      const result = toRowErrors('1', errors);
      expect(result).toEqual({
        1: {
          name: [{ field: 'name', message: 'Name required', severity: 'error' }],
          age: [{ field: 'age', message: 'Age required', severity: 'error' }],
        },
      });
    });

    it('groups multiple errors for same field', () => {
      const errors = [
        { field: 'name', message: 'Name required', severity: 'error' },
        { field: 'name', message: 'Name too short', severity: 'error' },
      ];
      const result = toRowErrors('1', errors);
      expect(result).toEqual({
        1: {
          name: [
            { field: 'name', message: 'Name required', severity: 'error' },
            { field: 'name', message: 'Name too short', severity: 'error' },
          ],
        },
      });
    });

    it('handles row-level errors (field: null)', () => {
      const errors = [
        { field: null, message: 'Row validation failed', severity: 'error' },
        { field: 'name', message: 'Name required', severity: 'error' },
      ];
      const result = toRowErrors('1', errors);
      expect(result).toEqual({
        1: {
          null: [{ field: null, message: 'Row validation failed', severity: 'error' }],
          name: [{ field: 'name', message: 'Name required', severity: 'error' }],
        },
      });
    });

    it('handles errors with missing field (defaults to null for row-level)', () => {
      // Edge case: error object without field property defaults to row-level
      const errors = [
        { message: 'Row validation failed', severity: 'error' },
      ];
      const result = toRowErrors('1', errors);
      expect(result).toEqual({
        1: {
          null: [{ message: 'Row validation failed', severity: 'error' }],
        },
      });
    });
  });

  describe('hasRowLevelError', () => {
    it('returns false when row has no errors', () => {
      const store = createEditStore();
      expect(store.hasRowLevelError('1')).toBe(false);
    });

    it('returns false when row has only field-level errors', () => {
      const store = createEditStore();
      store.startEdit('1', { id: '1', name: '' });
      store.setFieldErrors('1', 'name', [{ field: 'name', message: 'Required', severity: 'error' }]);
      expect(store.hasRowLevelError('1')).toBe(false);
    });

    it('returns true when row has row-level errors', () => {
      const store = createEditStore();
      store.startEdit('1', { id: '1', price: 60000, year: 1999 });
      store.setFieldErrors('1', null, [{ field: null, message: 'Row validation failed', severity: 'error' }]);
      expect(store.hasRowLevelError('1')).toBe(true);
    });

    it('returns true when row has both field-level and row-level errors', () => {
      const store = createEditStore();
      store.startEdit('1', { id: '1', name: '', price: 60000, year: 1999 });
      store.setFieldErrors('1', 'name', [{ field: 'name', message: 'Name required', severity: 'error' }]);
      store.setFieldErrors('1', null, [{ field: null, message: 'Row validation failed', severity: 'error' }]);
      expect(store.hasRowLevelError('1')).toBe(true);
    });
  });

  describe('clearFieldError with row-level errors', () => {
    it('clears row-level error when field is null', () => {
      const store = createEditStore();
      store.startEdit('1', { id: '1', price: 60000, year: 1999 });
      store.setFieldErrors('1', null, [{ field: null, message: 'Row validation failed', severity: 'error' }]);
      expect(store.hasRowLevelError('1')).toBe(true);
      
      store.clearFieldError('1', null);
      expect(store.hasRowLevelError('1')).toBe(false);
      expect(store.getSnapshot().validationState.rowErrors['1']).toBeUndefined();
    });
  });

  describe('mergeRowErrors with row-level errors', () => {
    it('merges row-level errors correctly', () => {
      const store = createEditStore();
      store.startEdit('1', { id: '1', name: '', price: 60000, year: 1999 });
      
      const mergeSlice = {
        1: {
          name: [{ field: 'name', message: 'Name required', severity: 'error' }],
          null: [{ field: null, message: 'Row validation failed', severity: 'error' }],
        },
      };
      
      store.mergeRowErrors(mergeSlice);
      const snapshot = store.getSnapshot();
      expect(snapshot.validationState.rowErrors['1'].name).toBeDefined();
      expect(snapshot.validationState.rowErrors['1'][null]).toBeDefined();
      expect(store.hasRowLevelError('1')).toBe(true);
    });
  });
});
