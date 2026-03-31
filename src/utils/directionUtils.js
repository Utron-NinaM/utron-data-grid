import { ALIGN_LEFT, ALIGN_RIGHT, DIRECTION_RTL, DIRECTION_LTR } from '../config/schema';

/**
 * @param {DIRECTION_LTR|DIRECTION_RTL} direction
 * @returns {string} format for dayjs
 */
export function getDateFormat(direction) {
  return direction === DIRECTION_RTL ? 'DD-MM-YY' : 'MM-DD-YY';
}

export function getDateTimeFormat(direction) {
  return direction === DIRECTION_RTL ? 'DD-MM-YY HH:mm:ss' : 'MM-DD-YY HH:mm:ss';
}

/** Default cell align by direction */
export function getDefaultAlign(direction) {
  return direction === DIRECTION_RTL ? ALIGN_RIGHT : ALIGN_LEFT;
}

/**
 * Horizontal scrollports use `dir="ltr"` while the table uses `dir="rtl"`, so `scrollLeft === 0` shows the
 * physical-left columns. For RTL reading order the start is on the right — scroll to the maximum offset
 * so the viewport aligns to the physical right.
 * @param {Element | null | undefined} el
 */
export function scrollRtlGridHorizontalStartToRight(el) {
  if (el == null || typeof el.scrollWidth !== 'number') return;
  if (el.scrollWidth <= el.clientWidth) return;
  el.scrollLeft = el.scrollWidth - el.clientWidth;
}
