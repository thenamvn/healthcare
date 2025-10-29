// api/health-api.ts
import { API_BASE_URL, CONFIG } from '@/constants/config';
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
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async getHealthData(childId: string): Promise<HealthData[]> {
    const response = await this.client.get<ApiResponse<HealthData[]>>(
      `/health/${childId}`
    );
    return response.data.data;
  }

  async getLatestHealthData(childId: string): Promise<HealthData> {
    const response = await this.client.get<ApiResponse<HealthData>>(
      `/health/${childId}/latest`
    );
    return response.data.data;
  }
}

export const healthApi = new HealthApi();