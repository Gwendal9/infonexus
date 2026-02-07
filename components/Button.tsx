import { forwardRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  title?: string;
  variant?: ButtonVariant;
  loading?: boolean;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', loading = false, disabled, onPress, ...touchableProps }, ref) => {
    const colors = useColors();
    const styles = createStyles(colors);
    const isDisabled = disabled || loading;

    const handlePress = (e: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    };

    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          styles.button,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          isDisabled && styles.disabled,
          touchableProps.style,
        ]}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.surface : colors.primary}
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.buttonText,
              variant === 'secondary' && styles.secondaryText,
              variant === 'ghost' && styles.ghostText,
            ]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + spacing.xs,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    disabled: {
      opacity: 0.5,
    },
    buttonText: {
      ...typography.titleMd,
      color: colors.surface,
    },
    secondaryText: {
      color: colors.primary,
    },
    ghostText: {
      color: colors.primary,
    },
  });
