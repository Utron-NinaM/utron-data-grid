/**
 * Frontend safeguards: do not use for security-critical decisions; backend must enforce.
 * - Filter/input max lengths are applied in filter and editor components (500/50 chars).
 * - React escapes by default; never use dangerouslySetInnerHTML with user/API data.
 */

/** Max length for text filter inputs */
export const MAX_FILTER_TEXT_LENGTH = 500;

/** Max length for number/filter value inputs */
export const MAX_FILTER_VALUE_LENGTH = 50;
