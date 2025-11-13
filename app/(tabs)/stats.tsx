// app/(tabs)/stats.tsx
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { healthService, HealthStats } from '@/services/health-service';
import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

export default function StatsScreen() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await healthService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!stats) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No data available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Statistics
        </ThemedText>

        <Card style={styles.statCard}>
          <ThemedText type="subtitle">Total Records</ThemedText>
          <ThemedText type="title">{stats.total_records}</ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText type="subtitle">Crying Detected</ThemedText>
          <ThemedText type="title" style={{ color: '#ff9800' }}>
            {stats.cry_detected_count}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText type="subtitle">Illness Detected</ThemedText>
          <ThemedText type="title" style={{ color: '#f44336' }}>
            {stats.sick_detected_count}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText type="subtitle">Average Temperature</ThemedText>
          <ThemedText type="title">
            {stats.avg_temperature.toFixed(1)}°C
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText type="subtitle">Average Humidity</ThemedText>
          <ThemedText type="title">
            {stats.avg_humidity.toFixed(1)}%
          </ThemedText>
        </Card>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 15,
  },
  title: {
    marginBottom: 10,
  },
  statCard: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
});