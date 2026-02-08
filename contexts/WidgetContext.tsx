import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WidgetConfig,
  WidgetType,
  WeatherSettings,
  CryptoSettings,
  DEFAULT_WIDGET_CONFIG,
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
