// app/(tabs)/stats.tsx
import { healthApi } from '@/api/health-api';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: Array<{ data: number[]; color?: (opacity: number) => string }>;
}

interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chart data states
  const [tempHumidityData, setTempHumidityData] = useState<ChartData | null>(null);
  const [cryFrequencyData, setCryFrequencyData] = useState<ChartData | null>(null);
  const [healthDistribution, setHealthDistribution] = useState<PieChartDataItem[]>([]);

  useEffect(() => {
    loadAllCharts();
  }, []);

  const loadAllCharts = async () => {
    try {
      setLoading(true);

      // 1. Temperature & Humidity Chart (24 hours)
      const tempHumidity = await healthApi.getTemperatureHumidityChart(
        '1 hour',
        1
      );
      
      if (tempHumidity.labels.length > 0) {
        setTempHumidityData({
          labels: tempHumidity.labels,
          datasets: [
            {
              data: tempHumidity.temperature,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Red for temp
            },
            {
              data: tempHumidity.humidity,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue for humidity
            },
          ],
        });
      }

      // 2. Cry Frequency Chart (7 days)
      const cryFreq = await healthApi.getCryFrequencyChart('1 day', 7);
      
      if (cryFreq.labels.length > 0) {
        setCryFrequencyData({
          labels: cryFreq.labels,
          datasets: [
            {
              data: cryFreq.cry_count,
              color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
            },
          ],
        });
      }

      // 3. Health Distribution Pie Chart
      const distribution = await healthApi.getHealthDistribution(7);
      
      if (distribution.labels.length > 0) {
        const pieData: PieChartDataItem[] = distribution.labels.map(
          (label: string, index: number) => ({
            name: label,
            value: distribution.values[index],
            color: distribution.colors[index],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
          })
        );
        setHealthDistribution(pieData);
      }
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllCharts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading charts...</ThemedText>
      </ThemedView>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 1,
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Temperature & Humidity Line Chart */}
        <Card style={styles.chartCard}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            📈 Temperature & Humidity (24h)
          </ThemedText>
          
          {tempHumidityData && tempHumidityData.labels.length > 0 ? (
            <>
              <LineChart
                data={tempHumidityData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={true}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
              
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 99, 132, 1)' }]} />
                  <ThemedText style={styles.legendText}>Temperature (°C)</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: 'rgba(54, 162, 235, 1)' }]} />
                  <ThemedText style={styles.legendText}>Humidity (%)</ThemedText>
                </View>
              </View>
            </>
          ) : (
            <ThemedText style={styles.noDataText}>
              No data available for the last 24 hours
            </ThemedText>
          )}
        </Card>

        {/* Cry Frequency Bar Chart */}
        <Card style={styles.chartCard}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            📊 Crying Frequency (7 days)
          </ThemedText>
          
          {cryFrequencyData && cryFrequencyData.labels.length > 0 ? (
            <BarChart
              data={cryFrequencyData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            <ThemedText style={styles.noDataText}>
              No crying data for the last 7 days
            </ThemedText>
          )}
        </Card>

        {/* Health Distribution Pie Chart */}
        <Card style={styles.chartCard}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            🥧 Health Status Distribution (7 days)
          </ThemedText>
          
          {healthDistribution.length > 0 ? (
            <PieChart
              data={healthDistribution}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          ) : (
            <ThemedText style={styles.noDataText}>
              No health status data available
            </ThemedText>
          )}
        </Card>

        {/* Summary Stats */}
        <Card style={styles.summaryCard}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            📋 Quick Summary
          </ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText>Total Crying Events:</ThemedText>
            <ThemedText type="defaultSemiBold">
              {cryFrequencyData?.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0}
            </ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText>Total Records:</ThemedText>
            <ThemedText type="defaultSemiBold">
              {healthDistribution.reduce((sum, item) => sum + item.value, 0)}
            </ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText>Most Common Status:</ThemedText>
            <ThemedText type="defaultSemiBold">
              {healthDistribution.length > 0
                ? healthDistribution.sort((a, b) => b.value - a.value)[0]?.name
                : 'N/A'}
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  chartCard: {
    padding: 16,
  },
  chartTitle: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 40,
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});