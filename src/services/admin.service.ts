import api from '@/lib/api';
import { Article, PageResult, User } from '@/types';

export const adminService = {
  async getPendingArticles(query: { current?: number; size?: number } = {}) {
    const response = await api.get<PageResult<Article>>('/admin/article/pending', { params: query });
    return response.data;
  },

  async auditArticle(articleId: number, pass: boolean, rejectReason?: string) {
    // API: POST /api/admin/article/{articleId}/audit
    // Param: pass (boolean), rejectReason (string)
    // Actually typically it takes a body or query params. 
    // Docs don't specify exact JSON body structure in the summary table but implied standard practice.
    // Let's assume JSON body.
    // Map boolean pass to status string
    const status = pass ? 'PUBLISHED' : 'REJECTED';
    const response = await api.post(`/admin/article/${articleId}/audit`, { status, rejectReason });
    return response.data;
  },

  async getUsers(query: { current?: number; size?: number; keyword?: string }) {
      const response = await api.get<PageResult<User>>('/admin/user/list', { params: query });
      return response.data;
  },

  async updateUserStatus(userId: number, status: number) {
      // 0: Normal, 1: Banned? Need to check docs.
      // Assuming PUT /api/admin/user/{userId}/status 
      const response = await api.put(`/admin/user/${userId}/status`, { status });
      return response.data;
  },

  // Category Management
  async createCategory(data: { name: string; description?: string; sortOrder?: number }) {
      const response = await api.post('/admin/category', data);
      return response.data;
  },
  async updateCategory(id: number, data: { name: string; description?: string; sortOrder?: number }) {
      const response = await api.put(`/admin/category/${id}`, data);
      return response.data;
  },
  async deleteCategory(id: number) {
      const response = await api.delete(`/admin/category/${id}`);
      return response.data;
  },

  // Tag Management
  async createTag(data: { name: string; color?: string }) {
      const response = await api.post('/admin/tag', data);
      return response.data;
  },
  async updateTag(id: number, data: { name: string; color?: string }) {
      const response = await api.put(`/admin/tag/${id}`, data);
      return response.data;
  },
  async deleteTag(id: number) {
      const response = await api.delete(`/admin/tag/${id}`);
      return response.data;
  }
};
