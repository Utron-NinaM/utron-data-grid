import { DEFAULT_FIELD_TYPE } from '../config/schema';
import {
  MIN_WIDTH_DEFAULT_PX,
  MIN_WIDTH_NO_FILTERS_PX,
  AVG_CHAR_WIDTH_PX,
  HEADER_CELL_PADDING_PX,
  ICON_ALLOWANCE_PX,
  ICON_ALLOWANCE_NO_FILTERS_PX,
  AUTO_MAX_WIDTH_MULTIPLIER,
} from '../constants';

export { MIN_WIDTH_DEFAULT_PX, MIN_WIDTH_NO_FILTERS_PX };

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

// Map cache for minWidth calculations (using string keys for defensive caching)
const builtInMinWidthCache = new Map();
const effectiveMinWidthCache = new Map();
const autoWidthEstimateCache = new Map();


/**
 * Gets the cache key for a column
 * @param {Object} column - Column object
 * @param {boolean} [filters=true] - Whether filters are shown (affects built-in min width)
 * @returns {string} Cache key
 */
function getCacheKey(column, filters = true) {
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;
  // Include minWidth and maxWidth in cache key to avoid stale values when constraints change
  const minWidth = column.minWidth != null ? column.minWidth : '';
  const maxWidth = column.maxWidth != null ? column.maxWidth : '';
  const filtersSuffix = filters === false ? '|nofilters' : '';
  return `${column.field}|${column.headerName || ''}|${filterType}|${minWidth}|${maxWidth}${filtersSuffix}`;
}

/**
 * Returns the built-in minimum width for a column.
 * 110px when filters are shown, 85px when filters: false.
 *
 * @param {Object} column - Column object
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.filters=true] - Whether filters are shown
 * @returns {number} Built-in minimum width in pixels
 */
export function getBuiltInMinWidth(column, options = {}) {
  const filters = options.filters !== false;
  const cacheKey = getCacheKey(column, filters);

  // Check cache first
  if (builtInMinWidthCache.has(cacheKey)) {
    return builtInMinWidthCache.get(cacheKey);
  }

  const value = filters ? MIN_WIDTH_DEFAULT_PX : MIN_WIDTH_NO_FILTERS_PX;
  builtInMinWidthCache.set(cacheKey, value);
  return value;
}

/**
 * Calculates the effective minimum width.
 * When column.minWidth is set, it fully overrides the built-in (user may go lower).
 * When not set, uses the built-in minimum.
 *
 * @param {Object} column - Column object
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.filters=true] - Whether filters are shown
 * @returns {number} Effective minimum width in pixels
 */
export function getEffectiveMinWidth(column, options = {}) {
  const filters = options.filters !== false;
  const cacheKey = getCacheKey(column, filters);

  // Check cache first
  if (effectiveMinWidthCache.has(cacheKey)) {
    return effectiveMinWidthCache.get(cacheKey);
  }

  const builtInMin = getBuiltInMinWidth(column, options);
  const userMinWidth = column.minWidth;

  const effectiveMin = userMinWidth != null ? userMinWidth : builtInMin;

  // Cache and return
  effectiveMinWidthCache.set(cacheKey, effectiveMin);
  return effectiveMin;
}

/**
 * Estimates the auto column width based on header text length.
 * Uses a two-tier strategy (Tier 1 implemented, Tier 2 extension point for future DOM measurement).
 * 
 * @param {Object} column - Column object
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.avgCharWidth] - Average character width (default 8px)
 * @param {number} [options.headerPadding] - Header padding (default 16px)
 * @param {number} [options.iconAllowance] - Icon allowance (default 32px)
 * @param {boolean} [options.filters=true] - Whether filters are shown
 * @returns {number} Estimated width in pixels
 */
export function estimateAutoColumnWidth(column, options = {}) {
  const filters = options.filters !== false;
  const cacheKey = getCacheKey(column, filters);

  // Check cache first
  if (autoWidthEstimateCache.has(cacheKey)) {
    return autoWidthEstimateCache.get(cacheKey);
  }

  const effectiveMinWidth = getEffectiveMinWidth(column, options);
  const avgCharWidth = options.avgCharWidth ?? AVG_CHAR_WIDTH_PX;
  const headerPadding = options.headerPadding ?? HEADER_CELL_PADDING_PX;
  const iconAllowance = options.iconAllowance ?? (filters ? ICON_ALLOWANCE_PX : ICON_ALLOWANCE_NO_FILTERS_PX);

  const headerText = column.headerName || '';
  const textWidth = headerText.length * avgCharWidth;

  // Tier 1 (fast estimate): Math.max(effectiveMinWidth, headerText.length * avgCharWidth + headerPadding + iconAllowance)
  const estimatedWidth = Math.max(
    effectiveMinWidth,
    textWidth + headerPadding + iconAllowance
  );

  // Cache and return
  autoWidthEstimateCache.set(cacheKey, estimatedWidth);
  return estimatedWidth;
}

/**
 * Returns the maximum width for an auto column to prevent it from growing indefinitely.
 * Auto columns should not expand beyond this limit (flex columns take space after).
 * 
 * @param {Object} column - Column object
 * @param {number} minWidth - Minimum width for the column
 * @returns {number} Maximum width in pixels
 */
export function getAutoMaxWidth(column, minWidth) {
  // Auto columns max width = max(minWidth * 2.5, minWidth)
  // This prevents auto columns from dominating the layout
  return Math.max(minWidth * AUTO_MAX_WIDTH_MULTIPLIER, minWidth);
}

/**
 * Calculates column widths using the layout algorithm.
 * 
 * Algorithm:
 * 1. Categorize columns (single pass): fixed, auto, flex
 * 2. Assign fixed widths
 * 3. Calculate auto column widths (min and max)
 * 4. Layout invariant check: if minTotal > containerWidth, return minWidths
 * 5. Calculate remaining space
 * 6. Distribute to flex columns
 * 7. Floor all widths to integers
 * 8. Clamp widths by minWidth/maxWidth
 * 9. Recompute total
 * 10. Distribute leftover pixels to growable columns only
 * 
 * @param {Object[]} columns - Array of column definitions
 * @param {number} containerWidth - Available container width in pixels
 * @param {Map<string, number>} columnState - Map of field -> width for user-resized columns (overrides only)
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.filters=true] - Whether filters are shown
 * @param {boolean} [options.fitToContainer=false] - When true, treat no-width/flex columns as flexible and cap total to container
 * @returns {{ columnWidthMap: Map<string, number>, totalWidth: number, enableHorizontalScroll: boolean }}
 */
export function calculateColumnWidths(columns, containerWidth, columnState = new Map(), options = {}) {
  // CRITICAL: Always create new Map for results (never reuse) - React relies on reference equality
  const resultMap = new Map();
  const filters = options.filters !== false;
  const fitToContainer = options.fitToContainer === true;
  const widthOptions = { filters };

  const safeColumnState = columnState || new Map();

  // Step 1: Single-pass categorization
  const fixedCols = [];
  const autoCols = [];
  const flexCols = [];

  columns.forEach(col => {
    if (safeColumnState.has(col.field)) {
      // User-resized column (has override) - treat as fixed
      fixedCols.push({ col, width: safeColumnState.get(col.field) });
    } else if (col.width != null) {
      // Explicit width - fixed
      fixedCols.push({ col, width: col.width });
    } else if (col.flex != null) {
      // Flex column
      flexCols.push({ col, flex: col.flex });
    } else if (col.defaultWidth != null) {
      // Default width - treat as fixed
      fixedCols.push({ col, width: col.defaultWidth });
    } else {
      // No explicit sizing: fitToContainer treats as flexible; otherwise auto
      if (fitToContainer) {
        flexCols.push({ col, flex: 1 });
      } else {
        autoCols.push(col);
      }
    }
  });

  // Step 2: Assign fixed widths
  let fixedTotal = 0;
  fixedCols.forEach(({ col, width }) => {
    const effectiveMin = getEffectiveMinWidth(col, widthOptions);
    const maxWidth = col.maxWidth;

    // Apply minWidth first
    let finalWidth = Math.max(width, effectiveMin);

    // Apply maxWidth only if it doesn't conflict with minWidth
    if (maxWidth != null && maxWidth >= effectiveMin) {
      finalWidth = Math.min(finalWidth, maxWidth);
    }
    // If maxWidth < effectiveMin, ignore maxWidth (minWidth takes precedence)

    resultMap.set(col.field, finalWidth);
    fixedTotal += finalWidth;
  });

  // Step 3: Calculate auto column widths
  const autoWidths = new Map();
  let autoMinTotal = 0;

  autoCols.forEach(col => {
    const minWidth = getEffectiveMinWidth(col, widthOptions);
    const estimatedWidth = estimateAutoColumnWidth(col, widthOptions);
    const autoMin = Math.max(estimatedWidth, minWidth);
    const autoMax = getAutoMaxWidth(col, minWidth);

    autoWidths.set(col.field, { min: autoMin, max: autoMax });
    autoMinTotal += autoMin;
  });

  // Step 4: Layout invariant check
  // Compute minTotal directly from already-calculated values
  let flexMinTotal = 0;
  flexCols.forEach(({ col }) => {
    flexMinTotal += getEffectiveMinWidth(col, widthOptions);
  });

  const minTotal = fixedTotal + autoMinTotal + flexMinTotal;

  if (minTotal > containerWidth) {
    // Container too small - return minWidths and enable scroll
    columns.forEach(col => {
      if (!resultMap.has(col.field)) {
        resultMap.set(col.field, getEffectiveMinWidth(col, widthOptions));
      }
    });
    return {
      columnWidthMap: resultMap,
      totalWidth: minTotal,
      enableHorizontalScroll: true
    };
  }

  // Step 5: Remaining space
  let remainingSpace = containerWidth - fixedTotal - autoMinTotal;

  // Step 6: Overflow check and flex distribution
  if (remainingSpace <= 0) {
    // No space for flex - collapse to minWidth
    flexCols.forEach(({ col }) => {
      const minWidth = getEffectiveMinWidth(col, widthOptions);
      resultMap.set(col.field, minWidth);
    });

    // Set auto columns to their min widths
    autoCols.forEach(col => {
      const { min } = autoWidths.get(col.field);
      resultMap.set(col.field, min);
    });
  } else {
    // Distribute to flex columns: reserve flexMinTotal first, then share the remainder by flex ratio
    // so the sum of flex widths never exceeds remainingSpace (avoids horizontal scroll)
    const totalFlex = flexCols.reduce((sum, { flex }) => sum + flex, 0);
    const extraSpace = Math.max(0, remainingSpace - flexMinTotal);

    if (totalFlex > 0) {
      flexCols.forEach(({ col, flex }) => {
        const minWidth = getEffectiveMinWidth(col, widthOptions);
        resultMap.set(col.field, minWidth + Math.floor((extraSpace * flex) / totalFlex));
      });
    }

    // Set auto columns to their min widths initially
    autoCols.forEach(col => {
      const { min } = autoWidths.get(col.field);
      resultMap.set(col.field, min);
    });
  }

  // Step 7: Floor all widths to integers
  columns.forEach(col => {
    if (resultMap.has(col.field)) {
      resultMap.set(col.field, Math.floor(resultMap.get(col.field)));
    }
  });

  // Step 8: Clamp widths by minWidth/maxWidth
  columns.forEach(col => {
    if (resultMap.has(col.field)) {
      let width = resultMap.get(col.field);
      const minWidth = getEffectiveMinWidth(col, widthOptions);
      const maxWidth = col.maxWidth;

      // If minWidth > maxWidth, minWidth takes precedence
      if (maxWidth != null && maxWidth >= minWidth) {
        width = Math.max(Math.min(width, maxWidth), minWidth);
      } else {
        width = Math.max(width, minWidth);
      }

      resultMap.set(col.field, width);
    }
  });

  // Step 9: Recompute total
  let totalWidth = Array.from(resultMap.values()).reduce((sum, w) => sum + w, 0);

  // Step 10: Distribute leftover pixels to growable columns only
  let leftover = containerWidth - totalWidth;

  if (leftover > 0) {
    // Growable columns = (flex OR auto) WITHOUT override in columnState
    let growableCols = [
      ...flexCols.filter(({ col }) => !safeColumnState.has(col.field)).map(({ col }) => ({ col, isAuto: false })),
      ...autoCols.filter(col => !safeColumnState.has(col.field)).map(col => ({ col, isAuto: true }))
    ];

    // Distribute leftover cyclically until consumed or all columns hit max
    while (leftover > 0 && growableCols.length > 0) {
      let madeProgress = false;
      for (let i = 0; i < growableCols.length && leftover > 0; i++) {
        const { col, isAuto } = growableCols[i];
        const currentWidth = resultMap.get(col.field);
        const maxWidth = col.maxWidth;

        // Check if column can grow
        let canGrow = true;
        if (maxWidth != null && currentWidth >= maxWidth) {
          canGrow = false;
        }

        // For auto columns, check autoMaxWidth
        if (isAuto) {
          const { max: autoMax } = autoWidths.get(col.field);
          if (currentWidth >= autoMax) {
            canGrow = false;
          }
        }

        if (canGrow) {
          resultMap.set(col.field, currentWidth + 1);
          leftover--;
          totalWidth++;
          madeProgress = true;
        }
      }

      // Remove columns that can't grow anymore
      if (!madeProgress) {
        break;
      }
      growableCols = growableCols.filter(({ col, isAuto }) => {
        const currentWidth = resultMap.get(col.field);
        const maxWidth = col.maxWidth;
        if (maxWidth != null && currentWidth >= maxWidth) return false;
        if (isAuto) {
          const { max: autoMax } = autoWidths.get(col.field);
          if (currentWidth >= autoMax) return false;
        }
        return true;
      });
    }
  }

  // Step 10.5: When fitToContainer, cap total to container if overflowing
  if (fitToContainer) {
    let finalTotal = Array.from(resultMap.values()).reduce((sum, w) => sum + w, 0);
    if (finalTotal > containerWidth && containerWidth > 0) {
      const scale = containerWidth / finalTotal;
      columns.forEach(col => {
        if (resultMap.has(col.field)) {
          const w = resultMap.get(col.field);
          const minW = getEffectiveMinWidth(col, widthOptions);
          resultMap.set(col.field, Math.max(minW, Math.floor(w * scale)));
        }
      });
      totalWidth = Array.from(resultMap.values()).reduce((sum, w) => sum + w, 0);
    }
  }

  // Step 11: Final invariant check (should be guaranteed by step 4, but verify)
  const finalTotal = Array.from(resultMap.values()).reduce((sum, w) => sum + w, 0);

  if (finalTotal < minTotal) {
    // This should never happen, but if it does, use minWidths
    columns.forEach(col => {
      if (!resultMap.has(col.field)) {
        resultMap.set(col.field, getEffectiveMinWidth(col, widthOptions));
      } else {
        const currentWidth = resultMap.get(col.field);
        const minWidth = getEffectiveMinWidth(col, widthOptions);
        resultMap.set(col.field, Math.max(currentWidth, minWidth));
      }
    });
    totalWidth = Array.from(resultMap.values()).reduce((sum, w) => sum + w, 0);
  }

  return {
    columnWidthMap: resultMap,
    totalWidth,
    enableHorizontalScroll: totalWidth > containerWidth
  };
}

