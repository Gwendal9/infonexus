import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRefreshSources } from '@/lib/mutations/useRefreshSources';
import { useNetwork } from '@/contexts/NetworkContext';

const LAST_REFRESH_KEY = 'last_refresh_timestamp';
const REFRESH_INTERVAL_MINUTES = 15;
const MIN_REFRESH_INTERVAL_MS = REFRESH_INTERVAL_MINUTES * 60 * 1000;

interface UseAutoRefreshOptions {
  enabled?: boolean;
  onRefreshStart?: () => void;
  onRefreshComplete?: (success: boolean) => void;
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const { enabled = true, onRefreshStart, onRefreshComplete } = options;
  const { isOnline } = useNetwork();
  const refreshSources = useRefreshSources();
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshing = useRef(false);

  const getLastRefreshTime = useCallback(async (): Promise<number | null> => {
    try {
      const stored = await AsyncStorage.getItem(LAST_REFRESH_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  }, []);

  const setLastRefreshTime = useCallback(async (timestamp: number) => {
    try {
      await AsyncStorage.setItem(LAST_REFRESH_KEY, timestamp.toString());
    } catch {
      // Ignore storage errors
    }
  }, []);

  const shouldRefresh = useCallback(async (): Promise<boolean> => {
    if (!isOnline || isRefreshing.current) return false;

    const lastRefresh = await getLastRefreshTime();
    if (!lastRefresh) return true;

    const elapsed = Date.now() - lastRefresh;
    return elapsed >= MIN_REFRESH_INTERVAL_MS;
  }, [isOnline, getLastRefreshTime]);

  const doRefresh = useCallback(async () => {
    if (isRefreshing.current || !isOnline) return;

    const needsRefresh = await shouldRefresh();
    if (!needsRefresh) return;

    isRefreshing.current = true;
    onRefreshStart?.();

    try {
      await refreshSources.mutateAsync();
      await setLastRefreshTime(Date.now());
      onRefreshComplete?.(true);
    } catch {
      onRefreshComplete?.(false);
    } finally {
      isRefreshing.current = false;
    }
  }, [isOnline, shouldRefresh, refreshSources, setLastRefreshTime, onRefreshStart, onRefreshComplete]);

  // Handle app state changes
  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App coming to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        doRefresh();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial refresh on mount if needed
    doRefresh();

    return () => {
      subscription.remove();
    };
  }, [enabled, doRefresh]);

  // Periodic refresh while app is active
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (appState.current === 'active') {
        doRefresh();
      }
    }, MIN_REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, doRefresh]);

  return {
    isRefreshing: refreshSources.isPending,
    refresh: doRefresh,
    lastRefreshTime: getLastRefreshTime,
  };
}
