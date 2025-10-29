// constants/config.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.example.com/socket';

export const CONFIG = {
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ALERT_VIBRATION_DURATION: 2000,
} as const;