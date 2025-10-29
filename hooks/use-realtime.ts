// hooks/use-realtime.ts
import { socketClient } from '@/api/socket-client';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

export function useRealtime(childId: string) {
  const [isCrying, setIsCrying] = useState(false);

  useEffect(() => {
    const handleCryingAlert = async (data: { crying: boolean }) => {
      if (data.crying) {
        setIsCrying(true);
        
        // Play alarm sound
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('@/assets/sounds/alarm.mp3')
          );
          await sound.playAsync();
        } catch (error) {
          console.error('Failed to play sound:', error);
        }

        // Trigger vibration
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Vibrate for 2 seconds
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 1000);
      } else {
        setIsCrying(false);
      }
    };

    socketClient.on('crying_alert', handleCryingAlert);

    return () => {
      socketClient.off('crying_alert', handleCryingAlert);
    };
  }, [childId]);

  return { isCrying };
}