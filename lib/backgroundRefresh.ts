import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pullFromSupabase } from '@/lib/sync';

const BACKGROUND_FETCH_TASK = 'background-article-refresh';
const BG_RESULT_KEY = '@infonexus_bg_refresh_result';

export interface BackgroundRefreshResult {
  articlesCount: number;
  timestamp: string;
}

// Must be called at module top level (expo-task-manager requirement)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  try {
    const result = await pullFromSupabase();
    const now = new Date().toISOString();
    await AsyncStorage.setItem(
      BG_RESULT_KEY,
      JSON.stringify({
        articlesCount: result.articlesCount,
        timestamp: now,
      })
    );
    console.log(`[BackgroundRefresh] Fetched ${result.articlesCount} articles`);
    return result.articlesCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundRefresh] Failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch(): Promise<void> {
  try {
    // Check if background fetch is available on this device/environment
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.log('[BackgroundRefresh] Not available on this device (status:', status, ')');
      return;
    }

    // Check if already registered to avoid duplicate registration errors
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      console.log('[BackgroundRefresh] Already registered');
      return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: Platform.OS === 'android',
    });
    console.log('[BackgroundRefresh] Registered');
  } catch (error) {
    // Silently fail - background refresh is a nice-to-have, not critical
    console.log('[BackgroundRefresh] Registration not supported:', error);
  }
}

export async function unregisterBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('[BackgroundRefresh] Unregistered');
    }
  } catch {
    // Task may not be registered, ignore
  }
}

export async function getBackgroundRefreshResult(): Promise<BackgroundRefreshResult | null> {
  try {
    const raw = await AsyncStorage.getItem(BG_RESULT_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(BG_RESULT_KEY);
    return JSON.parse(raw) as BackgroundRefreshResult;
  } catch {
    return null;
  }
}
