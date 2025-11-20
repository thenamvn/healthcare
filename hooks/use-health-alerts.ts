import { socketClient, AlertSeverity } from '@/api/socket-client';
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
      alert?: string;
      severity?: AlertSeverity;
      data: any;
    }) => {
      console.log('🚨 Alert received:', alertData);

      // ✅ Nếu không có alert message (HEALTH_UPDATE bình thường), xóa alert hiện tại
      if (!alertData.alert || !alertData.severity) {
        console.log('📊 Normal health update - clearing alert');
        setCurrentAlert(null);
        return;
      }

      const newAlert: HealthAlert = {
        event: alertData.event,
        message: alertData.alert,
        severity: alertData.severity,
        timestamp: new Date(),
        data: alertData.data,
      };

      setCurrentAlert(newAlert);
      
      // ✅ Chỉ thêm vào history nếu là cảnh báo nghiêm trọng (critical/warning)
      if (alertData.severity === 'critical' || alertData.severity === 'warning') {
        setAlertHistory((prev) => [newAlert, ...prev].slice(0, 50));
      }

      // Handle based on severity
      switch (alertData.severity) {
        case 'critical':
          await handleCriticalAlert(alertData.alert);
          break;
        case 'warning':
          await handleWarningAlert(alertData.alert);
          break;
        case 'info':
          await handleInfoAlert(alertData.alert);
          break;
      }

      // ✅ Auto-dismiss alert after duration
      const dismissTime = {
        critical: 10000,
        warning: 7000,
        info: 5000,
      }[alertData.severity];

      setTimeout(() => {
        setCurrentAlert((prev) => {
          if (prev?.timestamp === newAlert.timestamp) {
            return null;
          }
          return prev;
        });
      }, dismissTime);
    };

    socketClient.on('alert', handleAlert);
    socketClient.on('health_update', handleAlert);

    return () => {
      socketClient.off('alert', handleAlert);
      socketClient.off('health_update', handleAlert);
    };
  }, []);

  const handleCriticalAlert = async (message: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: false, volume: 1.0 }
      );
      setTimeout(() => sound.unloadAsync(), 5000);
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }

    for (let i = 0; i < 3; i++) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    Alert.alert(
      '🚨 CẢNH BÁO KHẨN CẤP',
      message,
      [{ text: 'ĐÃ HIỂU', style: 'cancel' }],
      { cancelable: false }
    );
  };

  const handleWarningAlert = async (message: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: false, volume: 0.6 }
      );
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('⚠️ Cảnh báo', message);
  };

  const handleInfoAlert = async (message: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // ✅ Info alert cũng hiển thị popup nhẹ
    Alert.alert('ℹ️ Thông báo', message, [{ text: 'OK' }]);
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