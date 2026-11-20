import api from '@/lib/axios';
import type { TopStudent } from '@/types/landing';

export const topStudentService = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: TopStudent[] }>('/top-students');
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; data: TopStudent }>('/top-students', formData);
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<{ success: boolean; data: TopStudent }>(
      `/top-students/${id}`,
      formData
    );
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/top-students/${id}`);
    return res.data;
  },
};