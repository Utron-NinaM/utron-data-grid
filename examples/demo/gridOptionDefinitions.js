/**
 * Metadata-driven definitions for all configurable DataGrid options.
 * Adding a new grid prop = add one entry; the config UI renders it automatically.
 *
 * @typedef {Object} OptionDefinition
 * @property {string} key - Option key (matches DataGrid options)
 * @property {string} label - Display label
 * @property {'boolean'|'number'|'string'|'select'|'json'|'numberArray'} type
 * @property {string} group - layout | behavior | filtering | selection | appearance | pagination | identity
 * @property {*} default - Default value
 * @property {Array<{value: string, label: string}>} [options] - For type 'select'
 * @property {string} [placeholder] - Placeholder for string/json inputs
 */

import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';
import { defaultGridConfig } from '../../src/config/defaultConfig';

export const GROUP_LABELS = {
  layout: 'Layout',
  behavior: 'Behavior',
  filtering: 'Filtering',
  selection: 'Selection',
  appearance: 'Appearance',
  pagination: 'Pagination',
  identity: 'Identity',
};

export const gridOptionDefinitions = [
  // Layout
  {
    key: 'direction',
    label: 'Direction',
    type: 'select',
    group: 'layout',
    default: DIRECTION_RTL,
    options: [
      { value: DIRECTION_LTR, label: 'LTR' },
      { value: DIRECTION_RTL, label: 'RTL' },
    ],
  },
  {
    key: 'gridId',
    label: 'Grid ID',
    type: 'string',
    group: 'layout',
    default: 'demo-grid',
    placeholder: 'Unique id for state persistence',
  },
  {
    key: 'sx',
    label: 'Root sx',
    type: 'json',
    group: 'layout',
    default: { height: '100%' },
    placeholder: 'MUI sx object (e.g. {"height":"100%","maxHeight":500})',
  },
  {
    key: 'fitToContainer',
    label: 'Fit to container',
    type: 'boolean',
    group: 'layout',
    default: defaultGridConfig.fitToContainer,
  },
  {
    key: 'showHorizontalScrollbar',
    label: 'Show horizontal scrollbar',
    type: 'boolean',
    group: 'layout',
    default: defaultGridConfig.showHorizontalScrollbar,
  },
  // Behavior
  {
    key: 'editable',
    label: 'Editable',
    type: 'boolean',
    group: 'behavior',
    default: defaultGridConfig.editable,
  },
  {
    key: 'pagination',
    label: 'Pagination',
    type: 'boolean',
    group: 'behavior',
    default: defaultGridConfig.pagination,
  },
  // Filtering
  {
    key: 'filters',
    label: 'Show filters',
    type: 'boolean',
    group: 'filtering',
    default: defaultGridConfig.filters ?? true,
  },
  // Selection
  {
    key: 'multiSelectable',
    label: 'Multi-selectable',
    type: 'boolean',
    group: 'selection',
    default: defaultGridConfig.multiSelectable,
  },
  {
    key: 'selectedRowStyle',
    label: 'Selected row style',
    type: 'json',
    group: 'selection',
    default: undefined,
    placeholder: 'MUI sx (e.g. {"backgroundColor":"#e3f2fd"})',
  },
  // Appearance
  {
    key: 'fontSize',
    label: 'Font size (px)',
    type: 'number',
    group: 'appearance',
    default: defaultGridConfig.fontSize,
  },
  {
    key: 'fontFamily',
    label: 'Font family',
    type: 'string',
    group: 'appearance',
    default: undefined,
    placeholder: 'e.g. Roboto, sans-serif',
  },
  {
    key: 'fontWeight',
    label: 'Font weight',
    type: 'string',
    group: 'appearance',
    default: undefined,
    placeholder: '400, 600, bold',
  },
  {
    key: 'headerConfig',
    label: 'Header config',
    type: 'json',
    group: 'appearance',
    default: undefined,
    placeholder: 'mainRow, filterRows, filterCells sx',
  },
  {
    key: 'bodyRow',
    label: 'Body row config',
    type: 'json',
    group: 'appearance',
    default: defaultGridConfig.bodyRow,
    placeholder: 'height, paddingTop, paddingBottom, etc.',
  },
  {
    key: 'toolbarClearButtonsSx',
    label: 'Toolbar clear buttons sx',
    type: 'json',
    group: 'appearance',
    default: undefined,
    placeholder: 'MUI sx for toolbar buttons',
  },
  // Pagination
  {
    key: 'pageSize',
    label: 'Page size',
    type: 'number',
    group: 'pagination',
    default: defaultGridConfig.pageSize,
  },
  {
    key: 'pageSizeOptions',
    label: 'Page size options',
    type: 'numberArray',
    group: 'pagination',
    default: defaultGridConfig.pageSizeOptions,
  },
];
