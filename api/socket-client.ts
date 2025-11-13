import { authService } from '@/services/auth-service';
import { WebSocketMessage } from '@/types/api.types';

// Get base WS URL from env
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      // Get token and user
      const token = await authService.getToken();
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const currentUser = await authService.getCurrentUser();
      const userId = currentUser.id;

      // Build correct WebSocket URL
      const wsUrl = `${WS_BASE_URL}/${userId}?token=${token}`;
      console.log('🔌 Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Received:', message);
          this.handleMessage(message);
        } catch (error) {
          console.error('Parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.notifyListeners('error', { error: 'Connection error' });
      };

      this.ws.onclose = (event) => {
        console.log('❌ Disconnected:', event.code, event.reason);
        this.ws = null;
        this.notifyListeners('connection', { status: 'disconnected' });

        // Auto-reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error: any) {
      console.error('❌ Connect failed:', error.message);
    }
  }

  disconnect() {
    if (this.ws) {
      console.log('🔌 Disconnecting...');
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private handleMessage(message: any) {
    const event = message.event || 'unknown';
    
    // Map backend events
    const eventMap: Record<string, string> = {
      'CRY_DETECTED': 'crying_alert',
      'HEALTH_UPDATE': 'health_update',
    };

    const mappedEvent = eventMap[event] || event.toLowerCase();
    this.notifyListeners(mappedEvent, message);
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const socketClient = new SocketClient();