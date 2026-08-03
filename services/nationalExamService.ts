import api from '@/lib/axios';
import type { NationalExam, ApiListResponse, ApiItemResponse } from '@/types/academic';

export const nationalExamService = {
  getAll: async () => {
    const res = await api.get<ApiListResponse<NationalExam>>('/national-exams');
    return res.data;
  },
  create: async (payload: { year: number; title?: string }) => {
    const res = await api.post<ApiItemResponse<NationalExam>>('/national-exams', payload);
    return res.data;
  },
  update: async (id: string, payload: { year: number; title?: string; isActive?: boolean }) => {
    const res = await api.put<ApiItemResponse<NationalExam>>(`/national-exams/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/national-exams/${id}`);
    return res.data;
  },
};