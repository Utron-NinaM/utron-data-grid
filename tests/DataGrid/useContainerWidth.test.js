import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContainerWidth } from '../../src/DataGrid/useContainerWidth';

describe('useContainerWidth', () => {
  let containerRef;
  let resizeObserverCallback;
  let mockResizeObserver;

  // Helper function to set clientWidth on an element
  const setClientWidth = (element, width) => {
    Object.defineProperty(element, 'clientWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  beforeEach(() => {
    containerRef = { current: document.createElement('div') };
    setClientWidth(containerRef.current, 1000);

    // Mock ResizeObserver
    mockResizeObserver = vi.fn();
    mockResizeObserver.mockImplementation((callback) => {
      resizeObserverCallback = callback;
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
      };
    });

    global.ResizeObserver = mockResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial width', () => {
    it('should return initial container width', () => {
      setClientWidth(containerRef.current, 1000);

      const { result } = renderHook(() => useContainerWidth(containerRef));

      expect(result.current).toBe(1000);
    });

    it('should return 0 when containerRef is null', () => {
      const { result } = renderHook(() => useContainerWidth({ current: null }));

      expect(result.current).toBe(0);
    });

    it('should return 0 when containerRef is undefined', () => {
      const { result } = renderHook(() => useContainerWidth(undefined));

      expect(result.current).toBe(0);
    });

    it('should return 0 when clientWidth is 0', () => {
      setClientWidth(containerRef.current, 0);

      const { result } = renderHook(() => useContainerWidth(containerRef));

      expect(result.current).toBe(0);
    });

    it('should not set width when clientWidth is 0 initially', () => {
      setClientWidth(containerRef.current, 0);

      const { result } = renderHook(() => useContainerWidth(containerRef));

      expect(result.current).toBe(0);
    });
  });

  describe('ResizeObserver integration', () => {
    it('should observe container element', () => {
      const mockObserve = vi.fn();
      mockResizeObserver.mockImplementation((callback) => {
        resizeObserverCallback = callback;
        return {
          observe: mockObserve,
          disconnect: vi.fn(),
        };
      });

      renderHook(() => useContainerWidth(containerRef));

      expect(mockResizeObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith(containerRef.current);
    });

    it('should disconnect ResizeObserver on unmount', () => {
      const mockDisconnect = vi.fn();
      mockResizeObserver.mockImplementation((callback) => {
        resizeObserverCallback = callback;
        return {
          observe: vi.fn(),
          disconnect: mockDisconnect,
        };
      });

      const { unmount } = renderHook(() => useContainerWidth(containerRef));

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should update width when ResizeObserver fires', async () => {
      let mockObserve;
      mockResizeObserver.mockImplementation((callback) => {
        resizeObserverCallback = callback;
        return {
          observe: (mockObserve = vi.fn()),
          disconnect: vi.fn(),
        };
      });

      const { result } = renderHook(() => useContainerWidth(containerRef));

      expect(result.current).toBe(1000);

      // Simulate resize
      setClientWidth(containerRef.current, 1200);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      // Wait for requestAnimationFrame
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(1200);
    });

    it('should use clientWidth from ResizeObserver entry', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      const mockTarget = { clientWidth: 1500 };
      act(() => {
        resizeObserverCallback([{ target: mockTarget }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(1500);
    });

    it('should ignore empty entries array', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      const initialWidth = result.current;

      act(() => {
        resizeObserverCallback([]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(initialWidth);
    });
  });

  describe('Debouncing', () => {
    it('should only update if width changes by >= 1px', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      const initialWidth = result.current;

      // Simulate sub-pixel change (< 1px)
      setClientWidth(containerRef.current, 1000.5);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      // Should not update for sub-pixel change
      expect(result.current).toBe(initialWidth);
    });

    it('should update when width changes by exactly 1px', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      setClientWidth(containerRef.current, 1001);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(1001);
    });

    it('should update when width changes by more than 1px', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      setClientWidth(containerRef.current, 1100);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(1100);
    });

    it('should batch updates with requestAnimationFrame', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      // Multiple rapid changes
      setClientWidth(containerRef.current, 1100);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      setClientWidth(containerRef.current, 1200);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      // Should only update once after requestAnimationFrame
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(1200);
    });
  });

  describe('Edge cases', () => {
    it('should handle containerRef changing', () => {
      const newRef = { current: document.createElement('div') };
      setClientWidth(newRef.current, 2000);

      const { result, rerender } = renderHook(
        ({ ref }) => useContainerWidth(ref),
        { initialProps: { ref: containerRef } }
      );

      expect(result.current).toBe(1000);

      rerender({ ref: newRef });

      expect(result.current).toBe(2000);
    });

    it('should handle containerRef becoming null', () => {
      const { result, rerender } = renderHook(
        ({ ref }) => useContainerWidth(ref),
        { initialProps: { ref: containerRef } }
      );

      expect(result.current).toBe(1000);

      rerender({ ref: { current: null } });

      expect(result.current).toBe(0);
    });

    it('should handle very large widths', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      setClientWidth(containerRef.current, 100000);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(100000);
    });

    it('should handle width decreasing', async () => {
      setClientWidth(containerRef.current, 2000);
      const { result } = renderHook(() => useContainerWidth(containerRef));

      expect(result.current).toBe(2000);

      setClientWidth(containerRef.current, 500);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(500);
    });

    it('should handle width going to zero', async () => {
      const { result } = renderHook(() => useContainerWidth(containerRef));

      setClientWidth(containerRef.current, 0);
      act(() => {
        resizeObserverCallback([{ target: containerRef.current }]);
      });

      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      expect(result.current).toBe(0);
    });
  });
});
