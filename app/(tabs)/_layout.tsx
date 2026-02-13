import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/contexts/ThemeContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { spacing } from '@/theme/spacing';

type IconName = 'newspaper' | 'globe' | 'heart' | 'grid' | 'settings';

export default function TabsLayout() {
  const colors = useColors();

  const styles = createStyles(colors);

  function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
    const iconName = focused ? name : (`${name}-outline` as const);
    return (
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Ionicons name={iconName} size={22} color={focused ? colors.primary : colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Feed',
            headerTitle: 'InfoNexus',
            tabBarIcon: ({ focused }) => <TabIcon name="newspaper" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="sources"
          options={{
            title: 'Sources',
            tabBarIcon: ({ focused }) => <TabIcon name="globe" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favoris',
            tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="widgets"
          options={{
            title: 'Widgets',
            tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Réglages',
            tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      elevation: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      paddingTop: spacing.xs,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 1,
    },
    iconContainer: {
      padding: 3,
      borderRadius: 10,
    },
    iconContainerActive: {
      backgroundColor: colors.primary + '15',
    },
    header: {
      backgroundColor: colors.surface,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
  });
