import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HealthMetricCard } from '@/components/health/health-metric-card';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ThemedText type="title" style={styles.title}>
          Baby Health Monitor
        </ThemedText>

        <ThemedView style={styles.metricsContainer}>
          <HealthMetricCard
            title="Temperature"
            value={36.5}
            unit="°C"
            icon="house.fill"
            status="normal"
          />
          <HealthMetricCard
            title="Humidity"
            value={65}
            unit="%"
            icon="paperplane.fill"
            status="normal"
          />
        </ThemedView>

        <ThemedView style={styles.statusCard}>
          <ThemedText type="subtitle">Current State</ThemedText>
          <ThemedText style={styles.stateText}>😴 Sleeping</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoBox}>
          <ThemedText type="defaultSemiBold">📱 App Status</ThemedText>
          <ThemedText style={styles.infoText}>
            • Real-time monitoring active{'\n'}
            • WebSocket: Connecting...{'\n'}
            • Last update: Just now
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  title: {
    marginBottom: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  stateText: {
    fontSize: 24,
    textAlign: 'center',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    opacity: 0.7,
    lineHeight: 22,
  },
});