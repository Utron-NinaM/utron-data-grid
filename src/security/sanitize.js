/**
 * Frontend safeguards: do not use for security-critical decisions; backend must enforce.
 * - Filter/input max lengths are applied in filter and editor components (see constants.js).
 * - React escapes by default; never use dangerouslySetInnerHTML with user/API data.
 */

import { MAX_TEXT_LENGTH, MAX_NUMBER_INPUT_LENGTH } from '../constants';

/** Max length for text filter inputs */
export const MAX_FILTER_TEXT_LENGTH = MAX_TEXT_LENGTH;

/** Max length for number/filter value inputs */
export const MAX_FILTER_VALUE_LENGTH = MAX_NUMBER_INPUT_LENGTH;
