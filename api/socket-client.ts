// api/socket-client.ts
import { WS_URL } from '@/constants/config';
import { WebSocketMessage } from '@/types/api.types';
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(childId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      query: { childId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('message', (message: WebSocketMessage) => {
      this.handleMessage(message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
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

  private handleMessage(message: WebSocketMessage) {
    const eventListeners = this.listeners.get(message.event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(message.data));
    }
  }
}

export const socketClient = new SocketClient();