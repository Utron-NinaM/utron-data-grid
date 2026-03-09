import { useState, useLayoutEffect, useCallback, useRef } from 'react';

const DEFAULT_VISIBLE_COUNT = 25;

const BASE_OVERSCAN_ROWS = 12;
const SEEK_IDLE_MS = 120;

// Placeholder mode should be rare.
// Only enable it for true large jumps, mainly thumb dragging or Home/End.
const LARGE_JUMP_ROWS = 80;
const LARGE_JUMP_VIEWPORTS = 2;

const DEBUG_VIRT_PERF = true;

function virtPerfLog(label, ...data) {
  if (!DEBUG_VIRT_PERF) return;
  const t = performance.now().toFixed(1);
  // eslint-disable-next-line no-console
  console.log(`[VirtPerf] ${t} ${label}`, data);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getVisibleCount(containerHeight, rowHeightPx) {
  if (containerHeight <= 0 || rowHeightPx <= 0) return DEFAULT_VISIBLE_COUNT;
  return Math.max(1, Math.ceil(containerHeight / rowHeightPx));
}

function computeVirtualWindow({
  rowCount,
  rowHeightPx,
  scrollTop,
  containerHeight,
  overscanRows,
  isScrollSeeking,
}) {
  if (rowCount === 0 || rowHeightPx <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      totalHeight: 0,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
      visibleCount: 0,
      overscanRows: 0,
      isScrollSeeking,
    };
  }

  const totalHeight = rowCount * rowHeightPx;
  const visibleCount = getVisibleCount(containerHeight, rowHeightPx);

  const unclampedStart = Math.floor(scrollTop / rowHeightPx) - overscanRows;
  const startIndex = clamp(unclampedStart, 0, rowCount);

  const desiredCount = visibleCount + overscanRows * 2;
  const endIndex = clamp(startIndex + desiredCount, 0, rowCount);

  const topSpacerHeight = startIndex * rowHeightPx;
  const bottomSpacerHeight = Math.max(0, totalHeight - (endIndex * rowHeightPx));

  return {
    startIndex,
    endIndex,
    totalHeight,
    topSpacerHeight,
    bottomSpacerHeight,
    visibleCount,
    overscanRows,
    isScrollSeeking,
  };
}

function areWindowsEqual(a, b) {
  return (
    a.startIndex === b.startIndex &&
    a.endIndex === b.endIndex &&
    a.totalHeight === b.totalHeight &&
    a.topSpacerHeight === b.topSpacerHeight &&
    a.bottomSpacerHeight === b.bottomSpacerHeight &&
    a.visibleCount === b.visibleCount &&
    a.overscanRows === b.overscanRows &&
    a.isScrollSeeking === b.isScrollSeeking
  );
}

function isLargeJump(deltaRows, visibleCount) {
  return (
    deltaRows >= LARGE_JUMP_ROWS ||
    deltaRows >= Math.max(visibleCount * LARGE_JUMP_VIEWPORTS, LARGE_JUMP_ROWS)
  );
}

function getOverscanRows({
  visibleCount,
  deltaRows,
  source,
  baseOverscan,
  isDraggingScrollbar,
  settle,
}) {
  if (settle) {
    return Math.max(baseOverscan, 8);
  }

  let overscan = Math.max(baseOverscan, 8);

  // Wheel should stay full-rendered, just add some buffer.
  if (source === 'wheel') {
    if (deltaRows >= 2) overscan = Math.max(overscan, 16);
    if (deltaRows >= 6) overscan = Math.max(overscan, visibleCount);
    return Math.ceil(overscan);
  }

  // Keyboard navigation like PageUp/PageDown should still render real rows.
  if (source === 'keyboard') {
    overscan = Math.max(overscan, visibleCount);
    if (deltaRows >= visibleCount) {
      overscan = Math.max(overscan, visibleCount * 2);
    }
    return Math.ceil(overscan);
  }

  // Scrollbar dragging may jump far, so overscan much more aggressively.
  if (isDraggingScrollbar) {
    overscan = Math.max(overscan, visibleCount * 2);
    if (deltaRows >= visibleCount) {
      overscan = Math.max(overscan, visibleCount * 3);
    }
    return Math.ceil(overscan);
  }

  // Unknown/pointer/programmatic scroll, stay conservative.
  if (deltaRows >= visibleCount) overscan = Math.max(overscan, visibleCount);
  if (deltaRows >= visibleCount * 2) overscan = Math.max(overscan, visibleCount * 2);

  return Math.ceil(overscan);
}

/**
 * Virtual row window:
 * - immediate range updates on every scroll
 * - no flushSync
 * - real rows for wheel / PageUp / PageDown
 * - placeholders only for true large jumps, mainly scrollbar thumb dragging
 */
export function useVirtualWindow({
  scrollContainerRef,
  scrollContainerReady,
  rowCount,
  rowHeightPx,
  overscan = BASE_OVERSCAN_ROWS,
}) {
  const [windowState, setWindowState] = useState(() => {
    const totalHeight = rowCount * rowHeightPx;
    const endIndex = Math.min(rowCount, DEFAULT_VISIBLE_COUNT + 2 * overscan);

    return {
      startIndex: 0,
      endIndex,
      totalHeight,
      topSpacerHeight: 0,
      bottomSpacerHeight: Math.max(0, totalHeight - (endIndex * rowHeightPx)),
      visibleCount: DEFAULT_VISIBLE_COUNT,
      overscanRows: overscan,
      isScrollSeeking: false,
    };
  });

  const lastScrollTopRef = useRef(0);
  const lastTimeRef = useRef(0);
  const idleTimeoutRef = useRef(null);

  const lastInputSourceRef = useRef('unknown');
  const isPointerDownRef = useRef(false);
  const isDraggingScrollbarRef = useRef(false);
  const pointerDownXRef = useRef(0);
  const pointerDownYRef = useRef(0);

  const updateWindow = useCallback((container, { settle = false } = {}) => {
    if (!container || rowCount === 0 || rowHeightPx <= 0) {
      setWindowState({
        startIndex: 0,
        endIndex: 0,
        totalHeight: 0,
        topSpacerHeight: 0,
        bottomSpacerHeight: 0,
        visibleCount: 0,
        overscanRows: 0,
        isScrollSeeking: false,
      });
      return;
    }

    const now = performance.now();
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const previousTop = lastScrollTopRef.current;
    const previousTime = lastTimeRef.current;

    const deltaPx = Math.abs(scrollTop - previousTop);
    const deltaRows = rowHeightPx > 0 ? Math.floor(deltaPx / rowHeightPx) : 0;
    const deltaTime = previousTime > 0 ? Math.max(1, now - previousTime) : 16;
    const velocityPxMs = deltaPx / deltaTime;
    const visibleCount = getVisibleCount(containerHeight, rowHeightPx);

    lastScrollTopRef.current = scrollTop;
    lastTimeRef.current = now;

    const source = lastInputSourceRef.current;

    const largeJump = isLargeJump(deltaRows, visibleCount);

    // Only allow placeholder mode for true large jumps while dragging the scrollbar,
    // or explicit Home/End keyboard jumps.
    const shouldSeek =
      !settle &&
      (
        (isDraggingScrollbarRef.current && largeJump) ||
        (source === 'keyboard' && largeJump)
      );

    const overscanRows = getOverscanRows({
      visibleCount,
      deltaRows,
      source,
      baseOverscan: overscan,
      isDraggingScrollbar: isDraggingScrollbarRef.current,
      settle,
    });

    const nextWindow = computeVirtualWindow({
      rowCount,
      rowHeightPx,
      scrollTop,
      containerHeight,
      overscanRows,
      isScrollSeeking: shouldSeek,
    });

    setWindowState((prev) => (areWindowsEqual(prev, nextWindow) ? prev : nextWindow));

    virtPerfLog(
      settle ? 'SCROLL_SETTLE' : 'SCROLL_UPDATE',
      'source:',
      source,
      'scrollTop:',
      scrollTop,
      'deltaRows:',
      deltaRows,
      'velocityPxMs:',
      velocityPxMs.toFixed(2),
      'startIndex:',
      nextWindow.startIndex,
      'endIndex:',
      nextWindow.endIndex,
      'rowCountInWindow:',
      nextWindow.endIndex - nextWindow.startIndex,
      'isScrollSeeking:',
      nextWindow.isScrollSeeking,
      'draggingScrollbar:',
      isDraggingScrollbarRef.current
    );

    if (idleTimeoutRef.current != null) {
      clearTimeout(idleTimeoutRef.current);
    }

    if (!settle) {
      idleTimeoutRef.current = setTimeout(() => {
        idleTimeoutRef.current = null;
        const currentContainer = scrollContainerRef?.current;
        if (!currentContainer) return;
        updateWindow(currentContainer, { settle: true });
      }, SEEK_IDLE_MS);
    }

    // Reset transient source after processing the scroll event.
    // Drag state remains until pointerup.
    lastInputSourceRef.current = 'unknown';
  }, [overscan, rowCount, rowHeightPx, scrollContainerRef]);

  useLayoutEffect(() => {
    const container = scrollContainerRef?.current;

    if (!scrollContainerReady || !container) {
      const totalHeight = rowCount * rowHeightPx;
      const endIndex = Math.min(rowCount, DEFAULT_VISIBLE_COUNT + 2 * overscan);

      setWindowState({
        startIndex: 0,
        endIndex,
        totalHeight,
        topSpacerHeight: 0,
        bottomSpacerHeight: Math.max(0, totalHeight - (endIndex * rowHeightPx)),
        visibleCount: DEFAULT_VISIBLE_COUNT,
        overscanRows: overscan,
        isScrollSeeking: false,
      });
      return undefined;
    }

    lastScrollTopRef.current = container.scrollTop;
    lastTimeRef.current = performance.now();

    updateWindow(container, { settle: true });

    const onWheel = () => {
      lastInputSourceRef.current = 'wheel';
    };

    const onKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        lastInputSourceRef.current = 'keyboard';
      }
    };

    const onPointerDown = (e) => {
      isPointerDownRef.current = true;
      pointerDownXRef.current = e.clientX;
      pointerDownYRef.current = e.clientY;
      lastInputSourceRef.current = 'pointer';

      const rect = container.getBoundingClientRect();
      const verticalScrollbarWidth = container.offsetWidth - container.clientWidth;
      const horizontalScrollbarHeight = container.offsetHeight - container.clientHeight;

      const onVerticalScrollbar =
        verticalScrollbarWidth > 0 &&
        e.clientX >= rect.right - verticalScrollbarWidth &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom - horizontalScrollbarHeight;

      const onHorizontalScrollbar =
        horizontalScrollbarHeight > 0 &&
        e.clientY >= rect.bottom - horizontalScrollbarHeight &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right - verticalScrollbarWidth;

      isDraggingScrollbarRef.current = onVerticalScrollbar || onHorizontalScrollbar;
    };

    const onPointerUp = () => {
      isPointerDownRef.current = false;
      isDraggingScrollbarRef.current = false;
    };

    const onPointerCancel = () => {
      isPointerDownRef.current = false;
      isDraggingScrollbarRef.current = false;
    };

    const onScroll = () => {
      updateWindow(container, { settle: false });
    };

    const resizeObserver = new ResizeObserver(() => {
      lastInputSourceRef.current = 'resize';
      updateWindow(container, { settle: true });
    });

    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    container.addEventListener('scroll', onScroll, { passive: true });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();

      if (idleTimeoutRef.current != null) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }

      isPointerDownRef.current = false;
      isDraggingScrollbarRef.current = false;
    };
  }, [overscan, rowCount, rowHeightPx, scrollContainerReady, scrollContainerRef, updateWindow]);

  return windowState;
}