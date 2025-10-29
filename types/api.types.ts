// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export interface WebSocketMessage {
  event: 'health_update' | 'crying_alert' | 'connection' | 'error';
  data: any;
  timestamp: string;
}