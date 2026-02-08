import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
  networkState: NetInfoState | null;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state) => {
      setNetworkState(state);
      setIsOnline(state.isConnected ?? true);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState(state);
      const online = state.isConnected ?? true;
      setIsOnline(online);
      console.log('[Network]', online ? 'Online' : 'Offline', state.type);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    const online = state.isConnected ?? true;
    setNetworkState(state);
    setIsOnline(online);
    return online;
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        networkState,
        checkConnection,
      }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
