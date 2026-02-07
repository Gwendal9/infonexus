import { useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'newspaper-outline',
    title: 'Votre revue de presse',
    description:
      'Agrégez toutes vos sources d\'info en un seul endroit. RSS, sites web, YouTube — tout centralisé.',
  },
  {
    id: '2',
    icon: 'library-outline',
    title: 'Catalogue de sources',
    description:
      'Choisissez parmi 50+ sources populaires ou ajoutez les vôtres. Le Monde, L\'Équipe, Hugo Décrypte...',
  },
  {
    id: '3',
    icon: 'pricetags-outline',
    title: 'Organisez par thèmes',
    description:
      'Créez vos thèmes (Sport, Tech, Finance...) et assignez-y vos sources pour filtrer facilement.',
  },
  {
    id: '4',
    icon: 'heart-outline',
    title: 'Sauvegardez vos favoris',
    description:
      'Gardez les articles importants pour les lire plus tard. Zéro pub, zéro algorithme, zéro bruit.',
  },
];

export function Onboarding() {
  const colors = useColors();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const styles = createStyles(colors);

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={styles.slide}>
      <Animated.View entering={FadeIn.delay(200)} style={styles.iconContainer}>
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>
        {item.title}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(400)} style={styles.description}>
        {item.description}
      </Animated.Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
        <Ionicons
          name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
          size={20}
          color="#FFF"
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skipButton: {
      position: 'absolute',
      top: 60,
      right: spacing.lg,
      zIndex: 10,
      padding: spacing.sm,
    },
    skipText: {
      ...typography.body,
      color: colors.textMuted,
    },
    slide: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      ...typography.titleLg,
      fontSize: 26,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
    },
    description: {
      ...typography.body,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: spacing.sm,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: spacing.xl,
      marginBottom: 50,
      paddingVertical: spacing.md,
      borderRadius: 12,
      gap: spacing.sm,
    },
    nextText: {
      ...typography.body,
      color: '#FFF',
      fontWeight: '600',
      fontSize: 16,
    },
  });
