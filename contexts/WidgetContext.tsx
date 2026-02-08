import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WidgetConfig,
  WidgetType,
  WeatherSettings,
  CryptoSettings,
  FootballSettings,
  StockSettings,
  NewsSettings,
  DEFAULT_WIDGET_CONFIG,
  PRESET_STOCKS,
  PRESET_ETFS,
} from '@/lib/widgets/types';

const STORAGE_KEY = 'widget_config';

interface WidgetContextType {
  config: WidgetConfig;
  isLoading: boolean;
  // Toggle widget enabled/disabled
  toggleWidget: (widgetId: WidgetType) => void;
  // Update weather settings
  updateWeatherSettings: (settings: Partial<WeatherSettings>) => void;
  // Update crypto settings
  updateCryptoSettings: (settings: Partial<CryptoSettings>) => void;
  // Update football settings
  updateFootballSettings: (settings: Partial<FootballSettings>) => void;
  // Update stock settings
  updateStockSettings: (settings: Partial<StockSettings>) => void;
  // Update news settings
  updateNewsSettings: (settings: Partial<NewsSettings>) => void;
  // Reset to defaults
  resetConfig: () => void;
}

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from storage on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        setConfig({
          ...DEFAULT_WIDGET_CONFIG,
          ...parsed,
          enabled: { ...DEFAULT_WIDGET_CONFIG.enabled, ...parsed.enabled },
          settings: {
            ...DEFAULT_WIDGET_CONFIG.settings,
            ...parsed.settings,
            weather: { ...DEFAULT_WIDGET_CONFIG.settings.weather, ...parsed.settings?.weather },
            crypto: { ...DEFAULT_WIDGET_CONFIG.settings.crypto, ...parsed.settings?.crypto },
            football: { ...DEFAULT_WIDGET_CONFIG.settings.football, ...parsed.settings?.football },
            stock: (() => {
              const merged = { ...DEFAULT_WIDGET_CONFIG.settings.stock, ...parsed.settings?.stock };
              // Filter out stock symbols that no longer exist in presets
              const validSymbols = new Set([...PRESET_STOCKS, ...PRESET_ETFS].map(s => s.symbol));
              const filteredItems = (merged.items ?? []).filter((item: any) => validSymbols.has(item.symbol));
              return { ...merged, items: filteredItems.length > 0 ? filteredItems : DEFAULT_WIDGET_CONFIG.settings.stock.items };
            })(),
            news: { ...DEFAULT_WIDGET_CONFIG.settings.news, ...parsed.settings?.news },
          },
        });
      }
    } catch (error) {
      console.error('[WidgetContext] Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: WidgetConfig) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('[WidgetContext] Failed to save config:', error);
    }
  };

  const toggleWidget = useCallback((widgetId: WidgetType) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        enabled: {
          ...prev.enabled,
          [widgetId]: !prev.enabled[widgetId],
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateWeatherSettings = useCallback((settings: Partial<WeatherSettings>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        settings: {
          ...prev.settings,
          weather: {
            ...prev.settings.weather,
            ...settings,
          },
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateCryptoSettings = useCallback((settings: Partial<CryptoSettings>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        settings: {
          ...prev.settings,
          crypto: {
            ...prev.settings.crypto,
            ...settings,
          },
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateFootballSettings = useCallback((settings: Partial<FootballSettings>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        settings: {
          ...prev.settings,
          football: {
            ...prev.settings.football,
            ...settings,
          },
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateStockSettings = useCallback((settings: Partial<StockSettings>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        settings: {
          ...prev.settings,
          stock: {
            ...prev.settings.stock,
            ...settings,
          },
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const updateNewsSettings = useCallback((settings: Partial<NewsSettings>) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        settings: {
          ...prev.settings,
          news: {
            ...prev.settings.news,
            ...settings,
          },
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_WIDGET_CONFIG);
    saveConfig(DEFAULT_WIDGET_CONFIG);
  }, []);

  return (
    <WidgetContext.Provider
      value={{
        config,
        isLoading,
        toggleWidget,
        updateWeatherSettings,
        updateCryptoSettings,
        updateFootballSettings,
        updateStockSettings,
        updateNewsSettings,
        resetConfig,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgetConfig() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgetConfig must be used within a WidgetProvider');
  }
  return context;
}
