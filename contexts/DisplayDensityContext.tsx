import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DisplayDensity = 'compact' | 'comfortable' | 'spacious';

interface DisplayDensityContextType {
  density: DisplayDensity;
  setDensity: (density: DisplayDensity) => void;
}

const DisplayDensityContext = createContext<DisplayDensityContextType | undefined>(undefined);

const STORAGE_KEY = 'display-density';

export function DisplayDensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<DisplayDensity>('comfortable');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load density from storage on mount
  useEffect(() => {
    async function loadDensity() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && ['compact', 'comfortable', 'spacious'].includes(stored)) {
          setDensityState(stored as DisplayDensity);
        }
      } catch (error) {
        console.error('[DisplayDensityContext] Error loading density:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadDensity();
  }, []);

  const setDensity = async (newDensity: DisplayDensity) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newDensity);
      setDensityState(newDensity);
    } catch (error) {
      console.error('[DisplayDensityContext] Error saving density:', error);
    }
  };

  // Don't block rendering while loading - just use default density
  return (
    <DisplayDensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DisplayDensityContext.Provider>
  );
}

export function useDisplayDensity() {
  const context = useContext(DisplayDensityContext);
  if (!context) {
    throw new Error('useDisplayDensity must be used within DisplayDensityProvider');
  }
  return context;
}
