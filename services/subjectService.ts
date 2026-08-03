import api from '@/lib/axios';
import type { Subject, ApiListResponse, ApiItemResponse } from '@/types/academic';

export const subjectService = {
  getAll: async () => {
    const res = await api.get<ApiListResponse<Subject>>('/subjects');
    return res.data;
  },
  create: async (payload: { name: string; description?: string }) => {
    const res = await api.post<ApiItemResponse<Subject>>('/subjects', payload);
    return res.data;
  },
  update: async (id: string, payload: { name: string; description?: string; isActive?: boolean }) => {
    const res = await api.put<ApiItemResponse<Subject>>(`/subjects/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};