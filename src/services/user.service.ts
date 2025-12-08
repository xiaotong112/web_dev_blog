import api from '@/lib/api';
import { User, ApiResult } from '@/types';

// DTOs
export interface UserProfileDTO {
  nickname?: string;
  avatar?: string;
  email?: string;
  position?: string;
  company?: string;
  bio?: string;
}

export interface PasswordChangeDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  user: User;
  articleCount: number;
  likeCount: number;
  viewCount: number;
}

export const userService = {
  async updateProfile(data: UserProfileDTO) {
    const response = await api.put<ApiResult<any>>('/user/profile', data);
    return response.data;
  },

  async changePassword(data: PasswordChangeDTO) {
    const response = await api.put<ApiResult<any>>('/user/password', data);
    return response.data;
  },

  async getUserStats(userId: number) {
    const response = await api.get<ApiResult<UserStats>>(`/user/${userId}/stats`);
    return response.data;
  }
};
