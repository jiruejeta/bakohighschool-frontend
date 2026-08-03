import api from '@/lib/axios';
import type { Section } from '@/types/studentManagement';

export const sectionService = {
  getAll: async (grade?: number) => {
    const res = await api.get<{ success: boolean; count: number; data: Section[] }>('/sections', {
      params: grade ? { grade } : undefined,
    });
    return res.data;
  },
  create: async (payload: { grade: number; name: string }) => {
    const res = await api.post<{ success: boolean; data: Section }>('/sections', payload);
    return res.data;
  },
  update: async (id: string, payload: { grade: number; name: string; isActive?: boolean }) => {
    const res = await api.put<{ success: boolean; data: Section }>(`/sections/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/sections/${id}`);
    return res.data;
  },
};