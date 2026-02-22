import { useState, useEffect, useRef } from 'react';

/**
 * Hook that tracks container width using ResizeObserver with debouncing.
 * When scrollContainerRef + scrollContainerReady are provided, observes the scroll container instead
 * (its clientWidth already excludes the vertical scrollbar, giving accurate available width).
 *
 * @param {React.RefObject} containerRef - Ref to the root container
 * @param {Object} [opts] - Optional
 * @param {React.RefObject} [opts.scrollContainerRef] - Ref to the scroll container (body overflow:auto)
 * @param {boolean} [opts.scrollContainerReady] - When true, scrollContainerRef.current is set
 * @returns {number} Container width in pixels (0 if not available)
 */
export function useContainerWidth(containerRef, opts = {}) {
  const { scrollContainerRef, scrollContainerReady } = opts;
  const [containerWidth, setContainerWidth] = useState(0);
  const lastWidthRef = useRef(0);

  const useScrollEl = Boolean(scrollContainerReady && scrollContainerRef?.current);
  const observeRef = useScrollEl ? scrollContainerRef : containerRef;  

  useEffect(() => {
    if (!observeRef?.current) {
      setContainerWidth(0);
      return;
    }

    const el = observeRef.current;
    const initialWidth = el.clientWidth;
    if (initialWidth > 0) {
      lastWidthRef.current = initialWidth;
      setContainerWidth(initialWidth);            
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const width = entries[0].target.clientWidth;
      if (Math.abs(width - lastWidthRef.current) >= 1) {
        lastWidthRef.current = width;
        requestAnimationFrame(() => setContainerWidth(width));
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [observeRef, scrollContainerRef, scrollContainerReady]);

  return containerWidth;
}
