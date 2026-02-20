import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'search-history';
const MAX_HISTORY_SIZE = 10;

interface SearchHistoryContextType {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from storage on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        }
      } catch (error) {
        console.error('[SearchHistoryContext] Error loading history:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadHistory();
  }, []);

  // Save history to storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    async function saveHistory() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('[SearchHistoryContext] Error saving history:', error);
      }
    }
    saveHistory();
  }, [history, isLoaded]);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    setHistory((prev) => {
      // Remove duplicate if it exists
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      // Add to front and limit size
      return [trimmed, ...filtered].slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setHistory((prev) => prev.filter((item) => item !== query));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Don't block rendering while loading - just use empty history
  return (
    <SearchHistoryContext.Provider value={{ history, addSearch, removeSearch, clearHistory }}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within SearchHistoryProvider');
  }
  return context;
}
