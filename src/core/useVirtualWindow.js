import { useState, useLayoutEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

const DEFAULT_VISIBLE_COUNT = 25;
/** Velocity (px/ms) above which we use medium overscan (~1 viewport). */
const VELOCITY_MEDIUM_PX_MS = 0.1;
/** Velocity (px/ms) above which we use fast overscan (~2 viewports). */
const VELOCITY_FAST_PX_MS = 0.25;
const IDLE_MS = 200;

function computeWindow(rowCount, rowHeightPx, scrollTop, containerHeight, overscan) {
  if (rowCount === 0 || rowHeightPx <= 0) {
    return { startIndex: 0, endIndex: 0, totalHeight: 0 };
  }
  const totalHeight = rowCount * rowHeightPx;
  const visibleCount = Math.ceil(containerHeight / rowHeightPx);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeightPx) - overscan);
  const endIndex = Math.min(rowCount, startIndex + visibleCount + 2 * overscan);
  return { startIndex, endIndex, totalHeight };
}

function getOverscanForVelocity(velocityPxMs, visibleCount, overscanBase) {
  const overscanMedium = Math.max(overscanBase, visibleCount);
  const overscanFast = Math.max(overscanMedium, visibleCount * 2);
  const absV = Math.abs(velocityPxMs);
  if (absV >= VELOCITY_FAST_PX_MS) return overscanFast;
  if (absV >= VELOCITY_MEDIUM_PX_MS) return overscanMedium;
  return overscanBase;
}

/** Add extra overscan when scroll jumped many rows in one frame to cover the next frame. */
function getDeltaOverscan(scrollTop, lastScrollTop, rowHeightPx, visibleCount, maxExtraRows = 50) {
  if (lastScrollTop == null || rowHeightPx <= 0) return 0;
  const deltaPx = Math.abs(scrollTop - lastScrollTop);
  const deltaRows = Math.floor(deltaPx / rowHeightPx);
  return Math.min(maxExtraRows, Math.max(0, deltaRows - visibleCount));
}

function updateFromContainer(container, rowCount, rowHeightPx, overscan, setWindow) {
  if (!container || rowCount === 0 || rowHeightPx <= 0) return;
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  const target = computeWindow(rowCount, rowHeightPx, scrollTop, containerHeight, overscan);

  setWindow((prev) => {
    const next = target;
    const changed = !(prev.startIndex === next.startIndex &&
      prev.endIndex === next.endIndex &&
      prev.totalHeight === next.totalHeight);
    return changed ? next : prev;
  });
}

/**
 * Hook to compute the visible window of rows for virtualization.
 * @param {Object} params
 * @param {React.RefObject<HTMLElement|null>} params.scrollContainerRef - Ref to the scrolling element
 * @param {boolean} params.scrollContainerReady - When true, ref is attached
 * @param {number} params.rowCount - Total number of rows
 * @param {number} params.rowHeightPx - Fixed row height in px
 * @param {number} [params.overscan] - Base extra rows to render above/below viewport (default 8)
 * @param {boolean} [params.useFlushSyncOnScroll=true] - When true, flush React updates synchronously on scroll to avoid viewport gap
 * @returns {{ startIndex: number, endIndex: number, totalHeight: number }}
 */
export function useVirtualWindow({
  scrollContainerRef,
  scrollContainerReady,
  rowCount,
  rowHeightPx,
  overscan = 8,
  useFlushSyncOnScroll = true,
}) {
  const [window, setWindow] = useState(() => {
    const totalHeight = rowCount * rowHeightPx;
    const end = Math.min(rowCount, DEFAULT_VISIBLE_COUNT + 2 * overscan);
    return { startIndex: 0, endIndex: end, totalHeight };
  });

  const rafScheduled = useRef(false);
  const lastScrollTopRef = useRef(null);
  const lastTimeRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const paramsRef = useRef({ rowCount, rowHeightPx, overscan });
  // const wheelDeltaAccumRef = useRef(0); // debug: wheel delta for logging
  const scrollSourceRef = useRef('unknown');

  paramsRef.current = { rowCount, rowHeightPx, overscan };

  const updateFromScroll = useCallback(() => {
    if (rafScheduled.current) return;
    rafScheduled.current = true;
    requestAnimationFrame(() => {
      rafScheduled.current = false;
      const container = scrollContainerRef?.current;
      if (!container || rowCount === 0 || rowHeightPx <= 0) return;

      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const now = performance.now();
      const lastScrollTop = lastScrollTopRef.current;
      const lastTime = lastTimeRef.current;
      const velocityPxMs =
        lastTime != null && now > lastTime
          ? (scrollTop - lastScrollTop) / (now - lastTime)
          : 0;
      lastScrollTopRef.current = scrollTop;
      lastTimeRef.current = now;

      const visibleCount = Math.ceil(containerHeight / rowHeightPx);
      let effectiveOverscan = getOverscanForVelocity(
        velocityPxMs,
        visibleCount,
        overscan
      );
      const deltaOverscan = getDeltaOverscan(scrollTop, lastScrollTop, rowHeightPx, visibleCount);
      effectiveOverscan = Math.max(effectiveOverscan, overscan + deltaOverscan);
      const isKeyboard = scrollSourceRef.current === 'keyboard';
      if (isKeyboard) {
        const overscanMedium = Math.max(overscan, visibleCount);
        effectiveOverscan = Math.max(effectiveOverscan, overscanMedium);
      }
      const useSync = useFlushSyncOnScroll && !isKeyboard;
      const doUpdate = () => updateFromContainer(container, rowCount, rowHeightPx, effectiveOverscan, setWindow);
      if (useSync) {
        flushSync(doUpdate);
        void container.scrollHeight;
      } else {
        doUpdate();
      }
      scrollSourceRef.current = 'unknown';

      if (idleTimeoutRef.current != null) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        idleTimeoutRef.current = null;
        const c = scrollContainerRef?.current;
        if (!c) return;
        const { rowCount: rc, rowHeightPx: rh, overscan: base } = paramsRef.current;
        if (rc === 0 || rh <= 0) return;
        updateFromContainer(c, rc, rh, base, setWindow);
      }, IDLE_MS);
    });
  }, [scrollContainerRef, rowCount, rowHeightPx, overscan, useFlushSyncOnScroll]);

  useLayoutEffect(() => {
    const container = scrollContainerRef?.current;
    if (!scrollContainerReady || !container) {
      const totalHeight = rowCount * rowHeightPx;
      const end = Math.min(rowCount, DEFAULT_VISIBLE_COUNT + 2 * overscan);
      setWindow({ startIndex: 0, endIndex: end, totalHeight });
      return;
    }

    lastScrollTopRef.current = null;
    lastTimeRef.current = null;
    updateFromContainer(container, rowCount, rowHeightPx, overscan, setWindow);

    const handleWheel = () => {
      scrollSourceRef.current = 'wheel';
    };
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
        scrollSourceRef.current = 'keyboard';
      }
    };
    const handleScroll = () => updateFromScroll();
    const resizeObserver = new ResizeObserver(() => {
      scrollSourceRef.current = 'resize';
      updateFromScroll();
    });

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (idleTimeoutRef.current != null) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
  }, [scrollContainerReady, scrollContainerRef, rowCount, rowHeightPx, overscan, updateFromScroll]);

  useLayoutEffect(() => {
    const totalHeight = rowCount * rowHeightPx;
    setWindow((prev) => {
      const start = Math.min(prev.startIndex, Math.max(0, rowCount - 1));
      const end = Math.min(rowCount, prev.endIndex);
      if (prev.totalHeight === totalHeight && prev.startIndex === start && prev.endIndex === end) return prev;
      return { startIndex: start, endIndex: end, totalHeight };
    });
  }, [rowCount, rowHeightPx]);

  return window;
}
