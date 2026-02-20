import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider, useColors, useThemeContext } from '@/contexts/ThemeContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { NetworkProvider, useNetwork } from '@/contexts/NetworkContext';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { TopicProvider } from '@/contexts/TopicContext';
import { DisplayDensityProvider } from '@/contexts/DisplayDensityContext';
import { SearchHistoryProvider } from '@/contexts/SearchHistoryContext';
import { PaywallBypassProvider } from '@/contexts/PaywallBypassContext';
import { Onboarding } from '@/components/Onboarding';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { initializeDatabase } from '@/lib/db';
import { processSyncQueue } from '@/lib/sync';
import { registerBackgroundFetch, getBackgroundRefreshResult } from '@/lib/backgroundRefresh';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry before any React code
initSentry();

function RootLayoutNav() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const { session, isLoading: authLoading } = useAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { isOnline } = useNetwork();
  const segments = useSegments();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);

  const styles = createStyles(colors);

  // Initialize database on app start
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log('[App] Database initialized');
        setDbReady(true);
      })
      .catch((error) => {
        console.error('[App] Failed to initialize database:', error);
        // Still allow app to run, just without offline support
        setDbReady(true);
      });
  }, []);

  // Process sync queue when coming back online
  useEffect(() => {
    if (isOnline && dbReady && session) {
      processSyncQueue().catch((error) => {
        console.error('[App] Failed to process sync queue:', error);
      });
    }
  }, [isOnline, dbReady, session]);

  // Register background fetch when ready
  useEffect(() => {
    if (dbReady && session) {
      registerBackgroundFetch();
    }
  }, [dbReady, session]);

  // Check for background refresh results when app comes to foreground
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const result = await getBackgroundRefreshResult();
        if (result && result.articlesCount > 0) {
          showSuccess(`${result.articlesCount} nouveaux articles`);
          queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [queryClient, showSuccess]);

  useEffect(() => {
    if (authLoading || onboardingLoading || !dbReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, authLoading, onboardingLoading, dbReady, segments, router]);

  if (authLoading || onboardingLoading || !dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show onboarding for new users (after login)
  if (session && !hasSeenOnboarding) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Onboarding />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DisplayDensityProvider>
        <PaywallBypassProvider>
        <SearchHistoryProvider>
          <NetworkProvider>
            <ToastProvider>
              <WidgetProvider>
                <TopicProvider>
                  <QueryProvider>
                    <AuthProvider>
                      <OnboardingProvider>
                        {children}
                      </OnboardingProvider>
                    </AuthProvider>
                  </QueryProvider>
                </TopicProvider>
              </WidgetProvider>
            </ToastProvider>
          </NetworkProvider>
        </SearchHistoryProvider>
        </PaywallBypassProvider>
      </DisplayDensityProvider>
    </ThemeProvider>
  );
}

function RootLayoutInner() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <AppProviders>
          <RootLayoutNav />
        </AppProviders>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default RootLayoutInner;

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
  });
