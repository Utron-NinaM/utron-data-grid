import { ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';

/**
 * LTR → MM-DD-YYYY, RTL → DD-MM-YYYY for display/input
 * @param {'ltr'|'rtl'} direction
 * @returns {string} format for dayjs
 */
export function getDateFormat(direction) {
  return direction === 'rtl' ? 'DD-MM-YYYY' : 'MM-DD-YYYY';
}

export function getDateTimeFormat(direction) {
  return direction === 'rtl' ? 'DD-MM-YYYY HH:mm' : 'MM-DD-YYYY HH:mm';
}

/** Default cell align by direction */
export function getDefaultAlign(direction) {
  return direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT;
}
