import { FILTER_TYPE_NUMBER, FILTER_TYPE_DATE, FILTER_TYPE_TEXT, FILTER_TYPE_LIST, DEFAULT_FIELD_TYPE } from '../config/schema';

// Pre-compute constant values
const MIN_WIDTH_WITH_FILTER_COMBO_PX = 120;
const MIN_WIDTH_DEFAULT_PX = 85;
const MIN_WIDTH_WITH_FILTER_COMBO = `${MIN_WIDTH_WITH_FILTER_COMBO_PX}px`;
const MIN_WIDTH_DEFAULT = `${MIN_WIDTH_DEFAULT_PX}px`;

// Simple memoization cache for calculateEffectiveWidth using WeakMap
const effectiveWidthCache = new WeakMap();

/**
 * Normalizes column width values to CSS-compatible strings.
 * @param {number|string|undefined} width - Column width (number in px, string like "20%", or undefined)
 * @returns {string|undefined} Normalized width string (e.g., "100px", "20%") or undefined
 */
export function normalizeWidth(width) {
    if (width == null) {
        return undefined;
    }

    if (typeof width === 'number') {
        return `${width}px`;
    }

    if (typeof width === 'string') {
        // If it already ends with % or px, return as-is
        if (width.endsWith('%') || width.endsWith('px')) {
            return width;
        }
        // Otherwise, assume it's a number string and append px
        return `${width}px`;
    }

    return undefined;
}

/**
 * Calculates the effective width as the maximum of user width and minWidth.
 * If both are pixels, compares numerically. If one is percentage, returns both.
 * Uses WeakMap for memoization to avoid recomputing for the same column object.
 * @param {Object} col - Column object
 * @returns {{ width: string|undefined, minWidth: string|undefined }} Effective width and minWidth
 */
export function calculateEffectiveWidth(col) {
    // Check cache first
    if (effectiveWidthCache.has(col)) {
        return effectiveWidthCache.get(col);
    }

    const userWidth = normalizeWidth(col.width);
    const filterType = col.filter ?? col.type ?? DEFAULT_FIELD_TYPE;
    
    // Filter combo minWidth (120px) applies when filterType is a combo type
    // When there's no filter combo, minWidth should be undefined (default 85px minWidth is handled elsewhere)
    const hasFilterCombo = filterType !== false && 
        filterType !== FILTER_TYPE_LIST &&
        (filterType === FILTER_TYPE_NUMBER || filterType === FILTER_TYPE_DATE || filterType === FILTER_TYPE_TEXT);
    
    const minWidth = hasFilterCombo ? MIN_WIDTH_WITH_FILTER_COMBO : undefined;
    const minWidthForComparison = hasFilterCombo ? MIN_WIDTH_WITH_FILTER_COMBO_PX : MIN_WIDTH_DEFAULT_PX;
    
    let result;
    if (!userWidth) {
        result = { width: undefined, minWidth };
    } else if (userWidth.endsWith('%')) {
        // If user width is percentage, we can't compare directly - keep both
        result = { width: userWidth, minWidth };
    } else {
        // Both are pixels - compare numerically
        const userPx = parseFloat(userWidth);

        if (isNaN(userPx)) {
            // If parsing fails, keep both
            result = { width: userWidth, minWidth };
        } else {
            // If user width is too small, enforce minimum (but only set minWidth if there's a filter combo)
            if (userPx >= minWidthForComparison) {
                result = { width: userWidth, minWidth: undefined };
            } else {
                // User width is too small - use minimum width
                const enforcedWidth = hasFilterCombo ? MIN_WIDTH_WITH_FILTER_COMBO : MIN_WIDTH_DEFAULT;
                result = { width: enforcedWidth, minWidth: undefined };
            }
        }
    }

    // Cache and return
    effectiveWidthCache.set(col, result);
    return result;
}
