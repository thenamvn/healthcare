// types/health.types.ts
export interface HealthData {
  id: string;
  childId: string;
  temperature: number;
  humidity: number;
  state: 'sleeping' | 'awake' | 'crying' | 'active';
  timestamp: string;
}

export interface HealthAlert {
  id: string;
  type: 'temperature' | 'crying' | 'abnormal';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  photo?: string;
}