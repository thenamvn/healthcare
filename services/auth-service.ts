import axios from 'axios';
import { secureStorage } from '@/utils/secure-storage';
import { API_BASE_URL } from '@/constants/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

class AuthService {
  private TOKEN_KEY = 'access_token';

  async register(data: RegisterData) {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/register`,
      data
    );
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    
    // Save token securely
    await secureStorage.setItem(this.TOKEN_KEY, response.data.access_token);
    return response.data;
  }

  async logout() {
    await secureStorage.deleteItem(this.TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    return await secureStorage.getItem(this.TOKEN_KEY);
  }

  async getCurrentUser() {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

export const authService = new AuthService();