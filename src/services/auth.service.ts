import api from '@/lib/api';
import { User } from '@/types';

// DTOs
export interface LoginDTO {
    username: string;
    password: string; 
}

export interface RegisterDTO {
    username: string;
    password: string;
    email?: string;
    nickname: string;
}

export const authService = {
  async login(data: LoginDTO) {
    const response = await api.post<{ code: number; message: string; data: { token: string; user: User } }>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterDTO) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  async getProfile() {
      const response = await api.get<{ code: number; message: string; data: User }>('/user/profile');
      return response.data;
  }
};
