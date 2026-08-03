import api from '@/lib/axios';

export const gradeService = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: number[] }>('/grades');
    return res.data;
  },
};