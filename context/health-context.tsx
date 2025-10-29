// context/health-context.tsx
import { healthApi } from '@/api/health-api';
import { socketClient } from '@/api/socket-client';
import { HealthAlert, HealthData } from '@/types/health.types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface HealthContextType {
  currentHealth: HealthData | null;
  healthHistory: HealthData[];
  alerts: HealthAlert[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children, childId }: { children: ReactNode; childId: string }) {
  const [currentHealth, setCurrentHealth] = useState<HealthData | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthData[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [latest, history] = await Promise.all([
        healthApi.getLatestHealthData(childId),
        healthApi.getHealthData(childId),
      ]);
      setCurrentHealth(latest);
      setHealthHistory(history);
    } catch (err) {
      setError('Failed to fetch health data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Connect WebSocket
    socketClient.connect(childId);

    const handleHealthUpdate = (data: HealthData) => {
      setCurrentHealth(data);
      setHealthHistory((prev) => [data, ...prev].slice(0, 50));
    };

    socketClient.on('health_update', handleHealthUpdate);

    return () => {
      socketClient.off('health_update', handleHealthUpdate);
      socketClient.disconnect();
    };
  }, [childId]);

  return (
    <HealthContext.Provider
      value={{
        currentHealth,
        healthHistory,
        alerts,
        isLoading,
        error,
        refreshData: fetchData,
      }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
}