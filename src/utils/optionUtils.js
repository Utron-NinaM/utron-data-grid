/**
 * Returns the stable key for an option. For { value, label } objects returns value; otherwise the option itself (primitive).
 * Key must be primitive and JSON-serializable (string, number, boolean).
 * @param {{ value: string | number | boolean, label: string } | string | number | boolean} option
 * @returns {string | number | boolean}
 */
export function getOptionValue(option) {
  return typeof option === 'object' && option != null && 'value' in option
    ? option.value
    : option;
}

export function getOptionLabel(option) {
  return typeof option === 'object' && option != null && option.label != null
    ? option.label
    : String(option);
}

/**
 * Builds a Map from option key to option for O(1) lookup.
 * @param {Array<{ value: string | number | boolean, label: string } | string | number | boolean>} options
 * @returns {Map<string | number | boolean, { value: string | number | boolean, label: string } | string | number | boolean>}
 */
export function getOptionMap(options) {
  if (!Array.isArray(options)) return new Map();
  return new Map(options.map((o) => [getOptionValue(o), o]));
}
