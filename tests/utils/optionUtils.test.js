import { describe, it, expect } from 'vitest';
import { getOptionValue, getOptionLabel, getOptionDescription, getOptionMap } from '../../src/utils/optionUtils';

describe('optionUtils', () => {
  describe('getOptionValue', () => {
    it('returns value for object option', () => {
      expect(getOptionValue({ value: 'a', label: 'A' })).toBe('a');
      expect(getOptionValue({ value: 201, label: 'SKU 201' })).toBe(201);
    });
    it('returns option for primitive', () => {
      expect(getOptionValue('x')).toBe('x');
      expect(getOptionValue(42)).toBe(42);
    });
  });

  describe('getOptionLabel', () => {
    it('returns label for object option', () => {
      expect(getOptionLabel({ value: 'a', label: 'A' })).toBe('A');
    });
    it('returns String(option) for primitive', () => {
      expect(getOptionLabel('x')).toBe('x');
    });
  });

  describe('getOptionDescription', () => {
    it('returns description when option is object with description', () => {
      expect(getOptionDescription({ value: '201', label: 'SKU 201', description: 'מעטפות כיס...' })).toBe('מעטפות כיס...');
      expect(getOptionDescription({ value: 1, label: 'One', description: 'First' })).toBe('First');
    });
    it('returns undefined when option is object without description', () => {
      expect(getOptionDescription({ value: 'a', label: 'A' })).toBeUndefined();
      expect(getOptionDescription({ value: 'a', label: 'A', description: undefined })).toBeUndefined();
    });
    it('returns undefined for primitive option', () => {
      expect(getOptionDescription('x')).toBeUndefined();
      expect(getOptionDescription(42)).toBeUndefined();
    });
    it('returns undefined for null/undefined', () => {
      expect(getOptionDescription(null)).toBeUndefined();
      expect(getOptionDescription(undefined)).toBeUndefined();
    });
  });

  describe('getOptionMap', () => {
    it('builds map by option value', () => {
      const options = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ];
      const map = getOptionMap(options);
      expect(map.get('a')).toEqual({ value: 'a', label: 'A' });
      expect(map.get('b')).toEqual({ value: 'b', label: 'B' });
    });
  });
});
