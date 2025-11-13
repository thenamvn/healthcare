import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    } else {
      // Use SecureStore for native
      await SecureStore.setItemAsync(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return null;
      }
    } else {
      // Use SecureStore for native
      return await SecureStore.getItemAsync(key);
    }
  }

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to delete from localStorage:', error);
      }
    } else {
      // Use SecureStore for native
      await SecureStore.deleteItemAsync(key);
    }
  }
}

export const secureStorage = new SecureStorage();