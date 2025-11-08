import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { OfflineProvider, useOffline } from './OfflineContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OfflineProvider>{children}</OfflineProvider>
);

describe('OfflineContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides offline context', () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    expect(result.current.isOnline).toBeDefined();
    expect(result.current.unsentMessages).toEqual([]);
    expect(result.current.queueMessage).toBeInstanceOf(Function);
    expect(result.current.clearQueue).toBeInstanceOf(Function);
    expect(result.current.removeFromQueue).toBeInstanceOf(Function);
  });

  it('queues messages', () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    act(() => {
      result.current.queueMessage({
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.unsentMessages).toHaveLength(1);
    expect(result.current.unsentMessages[0].id).toBe('msg1');
  });

  it('removes message from queue', () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    act(() => {
      result.current.queueMessage({
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.removeFromQueue('msg1');
    });

    expect(result.current.unsentMessages).toHaveLength(0);
  });

  it('clears all queued messages', () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    act(() => {
      result.current.queueMessage({
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test 1',
        timestamp: new Date().toISOString(),
      });
      result.current.queueMessage({
        id: 'msg2',
        conversationId: 'conv1',
        content: 'Test 2',
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.unsentMessages).toHaveLength(2);

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.unsentMessages).toHaveLength(0);
  });

  it('calls onReconnect when going from offline to online', async () => {
    const onReconnect = vi.fn();
    const { result } = renderHook(() => useOffline(), {
      wrapper: ({ children }) => (
        <OfflineProvider onReconnect={onReconnect}>{children}</OfflineProvider>
      ),
    });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => expect(result.current.isOnline).toBe(false));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(onReconnect).toHaveBeenCalled();
    });
  });
});
