import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaywallBypassContextType {
  bypassEnabled: boolean;
  setBypassEnabled: (enabled: boolean) => void;
}

const PaywallBypassContext = createContext<PaywallBypassContextType | undefined>(undefined);

const STORAGE_KEY = 'paywall-bypass-enabled';

export function PaywallBypassProvider({ children }: { children: ReactNode }) {
  const [bypassEnabled, setBypassState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) setBypassState(value === 'true');
    });
  }, []);

  const setBypassEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
      setBypassState(enabled);
    } catch (error) {
      console.error('[PaywallBypassContext] Error saving preference:', error);
    }
  };

  return (
    <PaywallBypassContext.Provider value={{ bypassEnabled, setBypassEnabled }}>
      {children}
    </PaywallBypassContext.Provider>
  );
}

export function usePaywallBypass() {
  const context = useContext(PaywallBypassContext);
  if (!context) {
    throw new Error('usePaywallBypass must be used within PaywallBypassProvider');
  }
  return context;
}
