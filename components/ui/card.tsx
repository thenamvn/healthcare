// components/ui/card.tsx
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated = true, ...props }: CardProps) {
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
          elevation: elevated ? 2 : 0,
          shadowOpacity: elevated ? 0.1 : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});