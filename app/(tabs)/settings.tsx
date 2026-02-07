import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeContext, useColors } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useThemeContext();
  const { resetOnboarding } = useOnboarding();

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
