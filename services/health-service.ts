// services/health-service.ts
import { API_BASE_URL } from '@/constants/config';
import { authService } from '@/services/auth-service';
import axios from 'axios';

export interface HealthUploadData {
  temperature: number;
  humidity: number;
  notes?: string;
  audioUri?: string;
}

export interface HealthStats {
  total_records: number;
  cry_detected_count: number;
  sick_detected_count: number;
  avg_temperature: number;
  avg_humidity: number;
  latest_record: any;
}

export interface TimeSeriesData {
  time: string;
  avg_temperature: number;
  avg_humidity: number;
  record_count: number;
  cry_count: number;
  sick_count: number;
}

class HealthService {
  private async getHeaders() {
    const token = await authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async uploadHealthData(data: HealthUploadData) {
    const formData = new FormData();
    formData.append('temperature', data.temperature.toString());
    formData.append('humidity', data.humidity.toString());
    
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    if (data.audioUri) {
      const filename = data.audioUri.split('/').pop() || 'audio.wav';
      formData.append('audio', {
        uri: data.audioUri,
        type: 'audio/wav',
        name: filename,
      } as any);
    }

    const response = await axios.post(
      `${API_BASE_URL}/health/upload`,
      formData,
      {
        headers: {
          ...(await this.getHeaders()),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async getHistory(params?: {
    limit?: number;
    offset?: number;
    cry_detected?: boolean;
    sick_detected?: boolean;
  }) {
    const response = await axios.get(`${API_BASE_URL}/health/history`, {
      headers: await this.getHeaders(),
      params,
    });
    return response.data;
  }

  async getStats(): Promise<HealthStats> {
    const response = await axios.get(`${API_BASE_URL}/health/stats`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getTimeSeries(interval: string = '1 hour') {
    const response = await axios.get<{ data: TimeSeriesData[] }>(
      `${API_BASE_URL}/health/timeseries`,
      {
        headers: await this.getHeaders(),
        params: { interval },
      }
    );
    return response.data;
  }
}

export const healthService = new HealthService();