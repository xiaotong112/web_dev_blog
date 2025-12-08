import api from '@/lib/api';
import { Article, PageResult } from '@/types';

export interface ArticleQuery {
    current?: number;
    size?: number;
    categoryId?: number;
    tagId?: number;
    keyword?: string;
    sortBy?: 'latest' | 'hot';
}

export const articleService = {
  // Public
  async getArticles(query: ArticleQuery = {}) {
    const response = await api.get<PageResult<Article>>('/article/list', { params: query });
    return response.data;
  },

  async getArticleDetail(id: number) {
    const response = await api.get<{ code: number; message: string; data: Article }>(`/article/${id}`);
    return response.data;
  },

  async getMyLikedArticles(query: { current?: number; size?: number }) {
      const response = await api.get<PageResult<Article>>('/article/liked', { params: query });
      return response.data;
  },

  // Interactive
  async likeArticle(id: number) {
      const response = await api.post(`/article/${id}/like`);
      return response.data;
  },

  async unlikeArticle(id: number) {
      const response = await api.delete(`/article/${id}/like`);
      return response.data;
  },

  // Creator
  async publishArticle(data: Partial<Article> & { tagIds?: number[]; categoryId: number }) {
      const response = await api.post('/article/publish', data);
      return response.data;
  },

  async getMyArticles(params: { current?: number; size?: number; status?: string }) {
      const response = await api.get<PageResult<Article>>('/article/my', { params });
      return response.data;
  },

  async updateArticle(id: number, data: Partial<Article> & { tagIds?: number[]; categoryId: number }) {
      const response = await api.put(`/article/${id}`, data);
      return response.data;
  },

  async deleteArticle(id: number) {
      const response = await api.delete(`/article/${id}`);
      return response.data;
  }
};
