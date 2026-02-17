import { useState, useEffect, useRef } from 'react';

/**
 * Hook that tracks container width using ResizeObserver with debouncing.
 * Uses requestAnimationFrame + width comparison to batch updates and ignore unchanged widths.
 * 
 * @param {React.RefObject} containerRef - Ref to the container element
 * @returns {number} Container width in pixels (0 if not available)
 */
export function useContainerWidth(containerRef) {
  const [containerWidth, setContainerWidth] = useState(0);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    if (!containerRef?.current) {
      setContainerWidth(0);
      return;
    }

    // Get initial width
    const initialWidth = containerRef.current.clientWidth;
    if (initialWidth > 0) {
      lastWidthRef.current = initialWidth;
      setContainerWidth(initialWidth);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      
      // Use clientWidth to account for vertical scrollbar
      const width = entries[0].target.clientWidth;
      
      // Only update if changed significantly (avoid sub-pixel thrash)
      if (Math.abs(width - lastWidthRef.current) >= 1) {
        lastWidthRef.current = width;
        // Batch with requestAnimationFrame
        requestAnimationFrame(() => {
          setContainerWidth(width);
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return containerWidth;
}
