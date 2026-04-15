import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const userId = this.getUserId();
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
      return config;
    });
  }

  private getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }

  setUserId(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userId', userId);
  }

  clearUserId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userId');
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getClient();
