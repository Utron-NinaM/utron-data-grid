/**
 * @param {Object[]} rows
 * @param {number} page 0-based
 * @param {number} pageSize
 * @returns {{ rows: Object[], total: number, from: number, to: number }}
 */
export function slicePage(rows, page, pageSize) {
  const total = rows.length;
  const from = Math.min(page * pageSize, total);
  const to = Math.min(from + pageSize, total);
  const slice = rows.slice(from, to);
  return { rows: slice, total, from: total === 0 ? 0 : from + 1, to };
}
