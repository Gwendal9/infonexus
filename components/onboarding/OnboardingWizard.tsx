import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StepIndicator } from './StepIndicator';
import { StepChooseThemes, OnboardingTheme } from './StepChooseThemes';
import { StepSelectSources } from './StepSelectSources';
import { StepConfigureWidgets } from './StepConfigureWidgets';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { useToast } from '@/contexts/ToastContext';
import { useColors } from '@/contexts/ThemeContext';
import { useAddTheme } from '@/lib/mutations/useThemeMutations';
import { useAddSource } from '@/lib/mutations/useSourceMutations';
import { sourceCatalog } from '@/lib/data/sourceCatalog';
import { WidgetType } from '@/lib/widgets/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const TOTAL_STEPS = 3;

export function OnboardingWizard() {
  const colors = useColors();
  const styles = createStyles(colors);
  const pagerRef = useRef<PagerView>(null);
  const { completeOnboarding } = useOnboarding();
  const { toggleWidget } = useWidgetConfig();
  const { showSuccess, showError } = useToast();
  const addThemeMutation = useAddTheme();
  const addSourceMutation = useAddSource();

  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 1 state
  const [themes, setThemes] = useState<OnboardingTheme[]>([]);

  // Step 2 state
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // Step 3 state
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetType[]>(['weather', 'crypto', 'quote']);

  const goToStep = (step: number) => {
    Haptics.selectionAsync();
    pagerRef.current?.setPage(step);
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create themes
      for (const theme of themes) {
        try {
          await addThemeMutation.mutateAsync({ name: theme.name, color: theme.color });
        } catch {
          // Theme may already exist, continue
        }
      }

      // Add sources from catalog
      for (const sourceId of selectedSourceIds) {
        const catalogSource = sourceCatalog.find((s) => s.id === sourceId);
        if (!catalogSource) continue;
        try {
          await addSourceMutation.mutateAsync({
            url: catalogSource.url,
            name: catalogSource.name,
            type: catalogSource.type,
          });
        } catch {
          // Source may already exist, continue
        }
      }

      // Configure widgets
      for (const widgetId of enabledWidgets) {
        toggleWidget(widgetId);
      }

      showSuccess('Configuration terminée !');
      completeOnboarding();
    } catch {
      showError('Erreur lors de la configuration');
    } finally {
      setIsFinishing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // themes optional
      case 1:
        return true; // sources optional
      case 2:
        return true; // widgets optional
      default:
        return true;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with skip */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Step indicator */}
      <StepIndicator current={currentStep} total={TOTAL_STEPS} />

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={(e) => setCurrentStep(e.nativeEvent.position)}
      >
        <View key="1">
          <StepChooseThemes themes={themes} onThemesChange={setThemes} />
        </View>
        <View key="2">
          <StepSelectSources
            selectedSourceIds={selectedSourceIds}
            onSourcesChange={setSelectedSourceIds}
          />
        </View>
        <View key="3">
          <StepConfigureWidgets
            enabledWidgets={enabledWidgets}
            onWidgetsChange={setEnabledWidgets}
          />
        </View>
      </PagerView>

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.prevText}>Précédent</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          disabled={!canProceed() || isFinishing}
        >
          {isFinishing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextText}>
                {currentStep === TOTAL_STEPS - 1 ? 'Terminer' : 'Suivant'}
              </Text>
              <Ionicons
                name={currentStep === TOTAL_STEPS - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color="#FFFFFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 60,
      paddingHorizontal: spacing.lg,
    },
    skipButton: {
      padding: spacing.sm,
    },
    skipText: {
      ...typography.body,
      color: colors.textMuted,
    },
    pager: {
      flex: 1,
    },
    navigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: 50,
      paddingTop: spacing.md,
    },
    prevButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
    },
    prevText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
      minWidth: 140,
    },
    nextText: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
  });
