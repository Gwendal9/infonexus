import { Stack } from 'expo-router';
import { useColors } from '@/contexts/ThemeContext';

export default function ArticleLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
