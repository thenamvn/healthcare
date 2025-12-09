import { API_BASE_URL, CONFIG } from '@/constants/config';
import { authService } from '@/services/auth-service';
import { ApiResponse } from '@/types/api.types';
import { HealthData } from '@/types/health.types';
import axios, { AxiosInstance } from 'axios';

class HealthApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add token to all requests
    this.client.interceptors.request.use(
      async (config) => {
        const token = await authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Get health history
  async getHealthData(params?: {
    limit?: number;
    offset?: number;
    cry_detected?: boolean;
    sick_detected?: boolean;
  }): Promise<HealthData[]> {
    const response = await this.client.get('/health/history', { params });
    return response.data;
  }

  // Get latest health record
  async getLatestHealthData(): Promise<HealthData> {
    const response = await this.client.get('/health/history', {
      params: { limit: 1 },
    });
    return response.data[0];
  }

  // Get statistics
  async getStats() {
    const response = await this.client.get('/health/stats');
    return response.data;
  }

  // ✅ Chart APIs
  async getTemperatureHumidityChart(interval: string = '1 hour', days: number = 1) {
    const response = await this.client.get('/health/charts/temperature-humidity', {
      params: { interval, days },
    });
    return response.data;
  }

  async getCryFrequencyChart(interval: string = '1 day', days: number = 7) {
    const response = await this.client.get('/health/charts/cry-frequency', {
      params: { interval, days },
    });
    return response.data;
  }

  async getHealthDistribution(days: number = 7) {
    const response = await this.client.get('/health/charts/health-distribution', {
      params: { days },
    });
    return response.data;
  }

  async getHourlyHeatmap(days: number = 7) {
    const response = await this.client.get('/health/charts/hourly-heatmap', {
      params: { days },
    });
    return response.data;
  }
}

export const healthApi = new HealthApi();