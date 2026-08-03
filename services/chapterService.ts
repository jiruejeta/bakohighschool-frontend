import api from '@/lib/axios';
import type { Chapter, ApiListResponse, ApiItemResponse } from '@/types/academic';

export const chapterService = {
  getAll: async (filters?: { subject?: string; grade?: number }) => {
    const res = await api.get<ApiListResponse<Chapter>>('/chapters', { params: filters });
    return res.data;
  },
  create: async (payload: { title: string; subject: string; grade: number; order?: number }) => {
    const res = await api.post<ApiItemResponse<Chapter>>('/chapters', payload);
    return res.data;
  },
  update: async (
    id: string,
    payload: { title: string; subject: string; grade: number; order?: number; isActive?: boolean }
  ) => {
    const res = await api.put<ApiItemResponse<Chapter>>(`/chapters/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/chapters/${id}`);
    return res.data;
  },
};