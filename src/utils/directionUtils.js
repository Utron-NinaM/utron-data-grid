import { ALIGN_LEFT, ALIGN_RIGHT, DIRECTION_RTL, DIRECTION_LTR } from '../config/schema';

/**
 * @param {DIRECTION_LTR|DIRECTION_RTL} direction
 * @returns {string} format for dayjs
 */
export function getDateFormat(direction) {
  return direction === DIRECTION_RTL ? 'DD-MM-YYYY' : 'MM-DD-YYYY';
}

export function getDateTimeFormat(direction) {
  return direction === DIRECTION_RTL ? 'DD-MM-YYYY HH:mm:ss' : 'MM-DD-YYYY HH:mm:ss';
}

/** Default cell align by direction */
export function getDefaultAlign(direction) {
  return direction === DIRECTION_RTL ? ALIGN_RIGHT : ALIGN_LEFT;
}
