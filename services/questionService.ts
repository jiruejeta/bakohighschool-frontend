import api from '@/lib/axios';
import type {
  QuestionListResponse,
  QuestionItemResponse,
  BulkQuestionInput,
  BulkUploadResponse,
} from '@/types/question';

export interface QuestionFilters {
  grade?: number;
  subject?: string;
  chapter?: string;
  nationalExam?: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export const questionService = {
  getAll: async (filters?: QuestionFilters) => {
    const res = await api.get<QuestionListResponse>('/questions', { params: filters });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<QuestionItemResponse>(`/questions/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<QuestionItemResponse>('/questions', formData);
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<QuestionItemResponse>(`/questions/${id}`, formData);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
  bulkCreate: async (payload: {
    grade: number;
    subject: string;
    chapter: string;
    nationalExam?: string | null;
    status?: string;
    questions: BulkQuestionInput[];
  }) => {
    const res = await api.post<BulkUploadResponse>('/questions/bulk', payload);
    return res.data;
  },
  bulkAssignVideo: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; message: string; updatedCount: number }>(
      '/questions/bulk-video',
      formData
    );
    return res.data;
  },
};