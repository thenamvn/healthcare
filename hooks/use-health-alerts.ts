import { socketClient, AlertSeverity, HealthUpdateMessage } from '@/api/socket-client';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface HealthAlert {
  event: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  data: any;
}

export function useHealthAlerts() {
  const [currentAlert, setCurrentAlert] = useState<HealthAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<HealthAlert[]>([]);

  useEffect(() => {
    const handleAlert = async (alertData: {
      event: string;
      alert: string;
      severity: AlertSeverity;
      data: any;
    }) => {
      console.log('🚨 Alert received:', alertData);

      const newAlert: HealthAlert = {
        event: alertData.event,
        message: alertData.alert,
        severity: alertData.severity,
        timestamp: new Date(),
        data: alertData.data,
      };

      setCurrentAlert(newAlert);
      setAlertHistory((prev) => [newAlert, ...prev].slice(0, 50));

      // Handle based on severity
      switch (alertData.severity) {
        case 'critical':
          await handleCriticalAlert(alertData.alert);
          break;
        case 'warning':
          await handleWarningAlert(alertData.alert);
          break;
        case 'info':
          handleInfoAlert(alertData.alert);
          break;
      }
    };

    socketClient.on('alert', handleAlert);

    return () => {
      socketClient.off('alert', handleAlert);
    };
  }, []);

  const handleCriticalAlert = async (message: string) => {
    // Play loud alarm
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: false, volume: 1.0 }
      );
      
      // Auto-stop after 5 seconds
      setTimeout(() => sound.unloadAsync(), 5000);
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }

    // Strong vibration pattern (3 times)
    for (let i = 0; i < 3; i++) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Show modal alert
    Alert.alert(
      '🚨 CẢNH BÁO KHẨN CẤP',
      message,
      [
        {
          text: 'ĐÃ HIỂU',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  const handleWarningAlert = async (message: string) => {
    // Play softer sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: false, volume: 0.6 }
      );
      
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }

    // Medium vibration
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Show alert
    Alert.alert('⚠️ Cảnh báo', message);
  };

  const handleInfoAlert = (message: string) => {
    // Light haptic only
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Silent notification (you can implement toast here)
    console.log('ℹ️ Info:', message);
  };

  const dismissAlert = () => {
    setCurrentAlert(null);
  };

  return {
    currentAlert,
    alertHistory,
    dismissAlert,
  };
}