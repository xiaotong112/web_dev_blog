import api from '@/lib/api';
import { Comment, PageResult } from '@/types';

export const commentService = {
  async getComments(articleId: number) {
    const response = await api.get<{ code: number; message: string; data: Comment[] }>(`/article/${articleId}/comments`);
    return response.data;
  },

  async addComment(articleId: number, content: string, parentId?: number) {
    const response = await api.post(`/article/${articleId}/comment`, { content, parentId });
    return response.data;
  },

  async deleteComment(commentId: number) {
    const response = await api.delete(`/comment/${commentId}`);
    return response.data;
  }
};
