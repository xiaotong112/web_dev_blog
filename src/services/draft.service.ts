import api from '@/lib/api';
import { Draft, PageResult, ApiResult } from '@/types';

export const draftService = {
  async saveDraft(data: Partial<Draft> & { articleId?: number }) {
    const response = await api.post<{ code: number; message: string; data: number }>('/draft/save', data);
    return response.data;
  },

  async getDraftList(query: { current?: number; size?: number } = {}) {
    const response = await api.get<PageResult<Draft>>('/draft/list', { params: query });
    return response.data;
  },

  async getDraftDetail(id: number) {
    const response = await api.get<{ code: number; message: string; data: Draft }>(`/draft/${id}`);
    return response.data;
  },

  async deleteDraft(id: number) {
    const response = await api.delete(`/draft/${id}`);
    return response.data;
  }
};
