// components/health/health-metric-card.tsx
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet } from 'react-native';

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: any;
  status?: 'normal' | 'warning' | 'error';
}

export function HealthMetricCard({
  title,
  value,
  unit,
  icon,
  status = 'normal',
}: HealthMetricCardProps) {
  const statusColor = useThemeColor({}, status === 'normal' ? 'success' : status === 'warning' ? 'warning' : 'error');

  return (
    <Card style={styles.container}>
      <IconSymbol name={icon} size={32} color={statusColor} />
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="title" style={[styles.value, { color: statusColor }]}>
        {value}
        <ThemedText type="default"> {unit}</ThemedText>
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 150,
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});