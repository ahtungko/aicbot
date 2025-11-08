import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  let onlineGetter: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onlineGetter = vi.spyOn(navigator, 'onLine', 'get');
  });

  afterEach(() => {
    onlineGetter.mockRestore();
  });

  it('should return true when initially online', () => {
    onlineGetter.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should return false when initially offline', () => {
    onlineGetter.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('should update to false when going offline', () => {
    onlineGetter.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('should update to true when going online', () => {
    onlineGetter.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
