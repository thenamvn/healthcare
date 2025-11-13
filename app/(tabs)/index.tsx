import { healthApi } from '@/api/health-api';
import { socketClient } from '@/api/socket-client';
import { HealthMetricCard } from '@/components/health/health-metric-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

interface HealthDataType {
  id: number;
  temperature: number;
  humidity: number;
  cry_detected: boolean;
  sick_detected: boolean;
  created_at: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestData, setLatestData] = useState<HealthDataType | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadData();
    connectWebSocket();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getLatestHealthData();
      console.log('📊 Latest health data:', data);
      setLatestData(data as any);
    } catch (error: any) {
      console.error('❌ Failed to load health data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    await socketClient.connect();

    // Listen for connection status
    socketClient.on('connection', (data) => {
      console.log('🔌 Connection status:', data);
      setWsConnected(data.status === 'connected');
    });

    // Listen for health updates
    socketClient.on('health_update', (data) => {
      console.log('📊 Received health update:', data);
      setLatestData(data.data || data);
    });

    // Listen for crying alerts
    socketClient.on('crying_alert', (message) => {
      console.log('🚨 Baby is crying!', message);
      
      // Update UI to show crying status
      if (message.data) {
        setLatestData((prev) => ({
          ...prev!,
          cry_detected: true,
          sick_detected: message.sick_detected || false,
        }));
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading health data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ThemedText type="title" style={styles.title}>
          Baby Health Monitor
        </ThemedText>

        {latestData ? (
          <>
            <ThemedView style={styles.metricsContainer}>
              <HealthMetricCard
                title="Temperature"
                value={latestData.temperature}
                unit="°C"
                icon="house.fill"
                status={latestData.temperature > 37.5 ? 'warning' : 'normal'}
              />
              <HealthMetricCard
                title="Humidity"
                value={latestData.humidity}
                unit="%"
                icon="paperplane.fill"
                status="normal"
              />
            </ThemedView>

            <ThemedView style={styles.statusCard}>
              <ThemedText type="subtitle">Current State</ThemedText>
              <ThemedText style={styles.stateText}>
                {latestData.cry_detected ? '😭 Crying' : '😴 Sleeping'}
              </ThemedText>
              {latestData.sick_detected && (
                <ThemedText style={styles.sickAlert}>⚠️ Baby may be sick!</ThemedText>
              )}
            </ThemedView>
          </>
        ) : (
          <ThemedView style={styles.noDataCard}>
            <ThemedText>No health data available</ThemedText>
            <ThemedText style={{ marginTop: 10, opacity: 0.7 }}>
              Upload data from backend to see it here
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.infoBox}>
          <ThemedText type="defaultSemiBold">📱 App Status</ThemedText>
          <ThemedText style={styles.infoText}>
            • Real-time monitoring: {wsConnected ? '✅ Active' : '⏳ Connecting...'}{'\n'}
            • WebSocket: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}{'\n'}• Last update:{' '}
            {latestData ? new Date(latestData.created_at).toLocaleTimeString() : 'Never'}
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
  sickAlert: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    fontWeight: '600',
  },
  noDataCard: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
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