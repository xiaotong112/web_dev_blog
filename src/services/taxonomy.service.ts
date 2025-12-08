import api from '@/lib/api';
import { Category, Tag, ApiResult } from '@/types';

export const categoryService = {
    async getAll() {
        const response = await api.get<ApiResult<Category[]>>('/category/list');
        return response.data;
    }
};

export const tagService = {
    async getAll() {
        const response = await api.get<ApiResult<Tag[]>>('/tag/list');
        return response.data;
    },
    async getHot(limit: number = 10) {
        const response = await api.get<ApiResult<Tag[]>>('/tag/hot', { params: { limit } });
        return response.data;
    }
};
