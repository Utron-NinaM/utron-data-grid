import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  getHeaderComboSlot,
  getFilterInputSlot,
  getFilterToInputSlot,
} from '../../src/filters/FilterBar';
import { OperatorDropdown } from '../../src/filters/filters/OperatorDropdown';
import {
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_LIST,
  OPERATOR_IN_RANGE,
  DIRECTION_LTR,
} from '../../src/config/schema';

const noop = () => {};

describe('FilterBar slot helpers', () => {
  describe('getHeaderComboSlot', () => {
    it('returns null when filter is false', () => {
      const column = { field: 'name', filter: false };
      expect(getHeaderComboSlot(column, {}, noop)).toBeNull();
    });

    it('returns null for list type', () => {
      const column = { field: 'tag', type: FIELD_TYPE_LIST };
      expect(getHeaderComboSlot(column, {}, noop)).toBeNull();
    });

    it('returns OperatorDropdown element for text/default column', () => {
      const column = { field: 'name', headerName: 'Name' };
      const slot = getHeaderComboSlot(column, {}, noop);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
      expect(slot.type).toBe(OperatorDropdown);
      expect(slot.props).toMatchObject({ value: undefined });
      expect(typeof slot.props.onChange).toBe('function');
    });

    it('returns OperatorDropdown for number column with state from filterModel', () => {
      const column = { field: 'score', type: FIELD_TYPE_NUMBER };
      const filterModel = { score: { operator: 'operatorEquals', value: 5 } };
      const slot = getHeaderComboSlot(column, filterModel, noop);
      expect(slot).not.toBeNull();
      expect(slot.type).toBe(OperatorDropdown);
      expect(slot.props.value).toEqual(filterModel.score);
    });

    it('returns OperatorDropdown for date column', () => {
      const column = { field: 'd', type: FIELD_TYPE_DATE };
      const slot = getHeaderComboSlot(column, {}, noop);
      expect(slot).not.toBeNull();
      expect(slot.type).toBe(OperatorDropdown);
    });
  });

  describe('getFilterInputSlot', () => {
    it('returns null when filter is false', () => {
      const column = { field: 'name', filter: false };
      expect(getFilterInputSlot(column, {}, noop, DIRECTION_LTR)).toBeNull();
    });

    it('returns element for text column', () => {
      const column = { field: 'name', headerName: 'Name' };
      const slot = getFilterInputSlot(column, {}, noop, DIRECTION_LTR);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
    });

    it('returns element for number column', () => {
      const column = { field: 'score', type: FIELD_TYPE_NUMBER };
      const slot = getFilterInputSlot(column, {}, noop, DIRECTION_LTR);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
    });

    it('returns element for date column', () => {
      const column = { field: 'd', type: FIELD_TYPE_DATE };
      const slot = getFilterInputSlot(column, {}, noop, DIRECTION_LTR);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
    });

    it('returns element for list column', () => {
      const column = { field: 'tag', type: FIELD_TYPE_LIST, options: ['a', 'b'] };
      const slot = getFilterInputSlot(column, {}, noop, DIRECTION_LTR);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
    });

    it('uses placeholder when translations function provided', () => {
      const column = { field: 'name' };
      const t = (key) => (key === 'filterPlaceholder' ? 'Filter here' : '');
      const slot = getFilterInputSlot(column, {}, noop, DIRECTION_LTR, t);
      expect(slot).not.toBeNull();
      expect(slot.props.placeholder).toBe('Filter here');
    });
  });

  describe('getFilterToInputSlot', () => {
    it('returns null when filter is false', () => {
      const column = { field: 'score', filter: false };
      const filterModel = { score: { operator: OPERATOR_IN_RANGE, value: 0, valueTo: 10 } };
      expect(getFilterToInputSlot(column, filterModel, noop)).toBeNull();
    });

    it('returns null when operator is not OPERATOR_IN_RANGE', () => {
      const column = { field: 'score', type: FIELD_TYPE_NUMBER };
      const filterModel = { score: { operator: 'operatorEquals', value: 5 } };
      expect(getFilterToInputSlot(column, filterModel, noop)).toBeNull();
    });

    it('returns null when state is missing', () => {
      const column = { field: 'score', type: FIELD_TYPE_NUMBER };
      expect(getFilterToInputSlot(column, {}, noop)).toBeNull();
    });

    it('returns element for number column with OPERATOR_IN_RANGE', () => {
      const column = { field: 'score', type: FIELD_TYPE_NUMBER };
      const filterModel = { score: { operator: OPERATOR_IN_RANGE, value: 0, valueTo: 100 } };
      const slot = getFilterToInputSlot(column, filterModel, noop);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
      expect(slot.props.value).toEqual(filterModel.score);
    });

    it('returns element for date column with OPERATOR_IN_RANGE', () => {
      const column = { field: 'd', type: FIELD_TYPE_DATE };
      const filterModel = { d: { operator: OPERATOR_IN_RANGE, value: '2022-01-01', valueTo: '2022-12-31' } };
      const slot = getFilterToInputSlot(column, filterModel, noop);
      expect(slot).not.toBeNull();
      expect(React.isValidElement(slot)).toBe(true);
    });

    it('returns null for text column even with OPERATOR_IN_RANGE in state', () => {
      const column = { field: 'name', type: 'text' };
      const filterModel = { name: { operator: OPERATOR_IN_RANGE, value: 'a', valueTo: 'z' } };
      expect(getFilterToInputSlot(column, filterModel, noop)).toBeNull();
    });
  });
});
