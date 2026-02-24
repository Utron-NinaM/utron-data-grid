/**
 * Shared configuration model for the config demo.
 */

import { gridOptionDefinitions } from './gridOptionDefinitions';

const CONTAINER_WIDTH_PRESETS = ['400px', '600px', '800px', '1000px', '100%'];

/**
 * Build default grid options from definitions.
 * @returns {Object}
 */
export function getDefaultDemoConfig() {
  const config = {};
  for (const def of gridOptionDefinitions) {
    config[def.key] = def.default;
  }
  return config;
}

/**
 * Merge partial config with defaults; fill missing keys.
 * @param {Object} config - Partial or full config
 * @returns {Object}
 */
export function mergeConfigWithDefaults(config) {
  const defaults = getDefaultDemoConfig();
  const merged = { ...defaults };
  for (const def of gridOptionDefinitions) {
    const val = config?.[def.key];
    if (val !== undefined && val !== null) {
      merged[def.key] = val;
    }
  }
  return merged;
}

/**
 * Normalize container width for CSS.
 * Accepts: 800, "800", "800px", "50%", "100%"
 * @param {string|number} value
 * @returns {string} CSS width value
 */
export function parseContainerWidth(value) {
  if (value == null || value === '') return '100%';
  const s = String(value).trim();
  if (s.endsWith('%') || s.endsWith('px')) return s;
  const num = parseFloat(s);
  if (!Number.isNaN(num)) return num >= 0 ? `${num}px` : '100%';
  return '100%';
}

export { CONTAINER_WIDTH_PRESETS };
