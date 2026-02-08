import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  Topic,
  TopicsConfig,
  GNewsCacheEntry,
  DEFAULT_TOPICS_CONFIG,
  GNEWS_DAILY_LIMIT,
  GNEWS_CACHE_DURATION_MS,
} from '@/lib/topics/types';

const STORAGE_KEY = 'topics_config';

interface TopicContextType {
  config: TopicsConfig;
  isLoading: boolean;
  addTopic: (name: string, keywords: string[], color: string) => void;
  updateTopic: (id: string, updates: Partial<Pick<Topic, 'name' | 'keywords' | 'color'>>) => void;
  deleteTopic: (id: string) => void;
  getGNewsCache: (topicId: string) => GNewsCacheEntry | null;
  setGNewsCache: (topicId: string, entry: GNewsCacheEntry) => void;
  canUseGNewsApi: () => boolean;
  incrementGNewsUsage: () => void;
}

const TopicContext = createContext<TopicContextType | null>(null);

export function TopicProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TopicsConfig>(DEFAULT_TOPICS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          ...DEFAULT_TOPICS_CONFIG,
          ...parsed,
          topics: parsed.topics ?? [],
          gnewsCache: parsed.gnewsCache ?? {},
          dailyUsage: parsed.dailyUsage ?? DEFAULT_TOPICS_CONFIG.dailyUsage,
        });
      }
    } catch (error) {
      console.error('[TopicContext] Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: TopicsConfig) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('[TopicContext] Failed to save config:', error);
    }
  };

  const addTopic = useCallback((name: string, keywords: string[], color: string) => {
    const newTopic: Topic = {
      id: Crypto.randomUUID(),
      name,
      keywords,
      color,
      createdAt: new Date().toISOString(),
    };
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        topics: [...prev.topics, newTopic],
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateTopic = useCallback((id: string, updates: Partial<Pick<Topic, 'name' | 'keywords' | 'color'>>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        topics: prev.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const deleteTopic = useCallback((id: string) => {
    setConfig((prev) => {
      const { [id]: _, ...remainingCache } = prev.gnewsCache;
      const newConfig = {
        ...prev,
        topics: prev.topics.filter((t) => t.id !== id),
        gnewsCache: remainingCache,
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const getGNewsCache = useCallback((topicId: string): GNewsCacheEntry | null => {
    const entry = config.gnewsCache[topicId];
    if (!entry) return null;
    const elapsed = Date.now() - new Date(entry.fetchedAt).getTime();
    if (elapsed > GNEWS_CACHE_DURATION_MS) return null;
    return entry;
  }, [config.gnewsCache]);

  const setGNewsCache = useCallback((topicId: string, entry: GNewsCacheEntry) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        gnewsCache: { ...prev.gnewsCache, [topicId]: entry },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const canUseGNewsApi = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];
    if (config.dailyUsage.date !== today) return true;
    return config.dailyUsage.count < GNEWS_DAILY_LIMIT;
  }, [config.dailyUsage]);

  const incrementGNewsUsage = useCallback(() => {
    setConfig((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const newUsage = prev.dailyUsage.date === today
        ? { date: today, count: prev.dailyUsage.count + 1 }
        : { date: today, count: 1 };
      const newConfig = { ...prev, dailyUsage: newUsage };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  return (
    <TopicContext.Provider
      value={{
        config,
        isLoading,
        addTopic,
        updateTopic,
        deleteTopic,
        getGNewsCache,
        setGNewsCache,
        canUseGNewsApi,
        incrementGNewsUsage,
      }}
    >
      {children}
    </TopicContext.Provider>
  );
}

export function useTopics() {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error('useTopics must be used within a TopicProvider');
  }
  return context;
}
