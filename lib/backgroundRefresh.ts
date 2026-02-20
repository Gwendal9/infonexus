import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pullFromSupabase } from '@/lib/sync';
import * as db from '@/lib/db';

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

    // Send notifications for articles matching topic keywords
    if (result.articlesCount > 0) {
      await sendTopicNotifications();
    }

    return result.articlesCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundRefresh] Failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function sendTopicNotifications(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Read topics config from AsyncStorage
    const raw = await AsyncStorage.getItem('topics_config');
    if (!raw) return;
    const config = JSON.parse(raw);
    const topics: Array<{ id: string; name: string; keywords: string[] }> = config.topics ?? [];
    if (topics.length === 0) return;

    // Ensure DB is initialized (background task runs in a fresh JS context)
    await db.initializeDatabase();

    // Get recent articles from local DB (last 30 minutes)
    const articles = await db.getArticles();
    const cutoff = Date.now() - 30 * 60 * 1000;
    const recentArticles = articles.filter((a) => {
      if (!a.published_at) return false;
      return new Date(a.published_at).getTime() > cutoff;
    });

    // Match articles against topics and send up to 3 notifications
    let notifCount = 0;
    for (const article of recentArticles) {
      if (notifCount >= 3) break;
      const matched = topics.filter((t) =>
        t.keywords.some((k) => article.title.toLowerCase().includes(k.toLowerCase()))
      );
      if (matched.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Nouveau : ${matched[0].name}`,
            body: article.title,
          },
          trigger: null, // immediate
        });
        notifCount++;
      }
    }
  } catch (error) {
    console.log('[BackgroundRefresh] Notification error:', error);
  }
}

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
