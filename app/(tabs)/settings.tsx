import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeContext, useColors } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { WIDGET_CATALOG, PRESET_CITIES, PRESET_CRYPTOS, WidgetType } from '@/lib/widgets/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useThemeContext();
  const { resetOnboarding } = useOnboarding();
  const { config, toggleWidget, updateWeatherSettings, updateCryptoSettings } = useWidgetConfig();

  const [expandedWidget, setExpandedWidget] = useState<WidgetType | null>(null);

  const styles = createStyles(colors);

  const themeOptions: { value: ThemeOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Clair', icon: 'sunny-outline' },
    { value: 'dark', label: 'Sombre', icon: 'moon-outline' },
    { value: 'system', label: 'Système', icon: 'phone-portrait-outline' },
  ];

  const handleResetOnboarding = () => {
    Alert.alert(
      "Revoir l'onboarding",
      "Voulez-vous revoir l'écran de bienvenue ?",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: resetOnboarding },
      ]
    );
  };

  const handleToggleWidget = (widgetId: WidgetType) => {
    Haptics.selectionAsync();
    toggleWidget(widgetId);
  };

  const handleCitySelect = (city: typeof PRESET_CITIES[0]) => {
    Haptics.selectionAsync();
    updateWeatherSettings({
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    });
  };

  const handleCryptoToggle = (crypto: typeof PRESET_CRYPTOS[0]) => {
    Haptics.selectionAsync();
    const current = config.settings.crypto.currencies;
    const isSelected = current.some((c) => c.id === crypto.id);

    if (isSelected) {
      if (current.length <= 1) return;
      updateCryptoSettings({
        currencies: current.filter((c) => c.id !== crypto.id),
      });
    } else {
      if (current.length >= 4) return;
      updateCryptoSettings({
        currencies: [...current, crypto],
      });
    }
  };

  const toggleExpand = (widgetId: WidgetType) => {
    Haptics.selectionAsync();
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>{user?.email}</Text>
              <Text style={styles.accountLabel}>Connecté</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.card}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                index < themeOptions.length - 1 && styles.optionBorder,
              ]}
              onPress={() => setMode(option.value)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, mode === option.value && styles.iconContainerActive]}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={mode === option.value ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              {mode === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Widgets Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widgets</Text>
        {WIDGET_CATALOG.map((widget) => {
          const isEnabled = config.enabled[widget.id];
          const isExpanded = expandedWidget === widget.id;

          return (
            <View key={widget.id} style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <View style={styles.widgetInfo}>
                  <View style={[styles.widgetIconContainer, isEnabled && styles.widgetIconActive]}>
                    <Ionicons
                      name={widget.icon as any}
                      size={20}
                      color={isEnabled ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <View style={styles.widgetText}>
                    <Text style={styles.widgetName}>{widget.name}</Text>
                    <Text style={styles.widgetDescription}>{widget.description}</Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggleWidget(widget.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '50' }}
                  thumbColor={isEnabled ? colors.primary : colors.textMuted}
                />
              </View>

              {widget.hasSettings && isEnabled && (
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => toggleExpand(widget.id)}
                >
                  <Text style={styles.settingsText}>
                    {isExpanded ? 'Masquer' : 'Personnaliser'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}

              {/* Weather Settings */}
              {widget.id === 'weather' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Ville</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_CITIES.map((city) => (
                      <TouchableOpacity
                        key={city.name}
                        style={[
                          styles.optionChip,
                          config.settings.weather.city === city.name && styles.optionChipActive,
                        ]}
                        onPress={() => handleCitySelect(city)}
                      >
                        <Text
                          style={[
                            styles.optionChipText,
                            config.settings.weather.city === city.name && styles.optionChipTextActive,
                          ]}
                        >
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Crypto Settings */}
              {widget.id === 'crypto' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Cryptomonnaies (max 4)</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_CRYPTOS.map((crypto) => {
                      const isSelected = config.settings.crypto.currencies.some(
                        (c) => c.id === crypto.id
                      );
                      return (
                        <TouchableOpacity
                          key={crypto.id}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleCryptoToggle(crypto)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {crypto.symbol}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Other Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Autres</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.option, styles.optionBorder]} onPress={handleResetOnboarding}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.optionLabel}>Revoir l'onboarding</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.optionLabel}>Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Button title="Se déconnecter" variant="secondary" onPress={signOut} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>InfoNexus</Text>
        <Text style={styles.footerSubtext}>Votre revue de presse personnalisée</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginLeft: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.md,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfo: {
      flex: 1,
    },
    accountEmail: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    accountLabel: {
      ...typography.caption,
      color: colors.statusOk,
      marginTop: 2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainerActive: {
      backgroundColor: colors.primary + '15',
    },
    optionLabel: {
      ...typography.body,
      color: colors.textPrimary,
    },
    versionText: {
      ...typography.body,
      color: colors.textMuted,
    },
    // Widget styles
    widgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    widgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    widgetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    widgetIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    widgetIconActive: {
      backgroundColor: colors.primary + '15',
    },
    widgetText: {
      flex: 1,
    },
    widgetName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    widgetDescription: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingsText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
    settingsContent: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingsLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    optionChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionChipText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    optionChipTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xxl,
    },
    footerText: {
      ...typography.titleMd,
      color: colors.primary,
    },
    footerSubtext: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
