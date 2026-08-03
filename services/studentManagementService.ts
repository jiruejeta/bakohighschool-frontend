import api from '@/lib/axios';
import type {
  Student,
  CreatedStudentCredential,
  BulkStudentResponse,
} from '@/types/studentManagement';

export const studentManagementService = {
  getAll: async (filters?: { grade?: number; section?: string; keyword?: string }) => {
    const res = await api.get<{ success: boolean; count: number; data: Student[] }>('/students', {
      params: filters,
    });
    return res.data;
  },
  create: async (payload: { name: string; section: string }) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: CreatedStudentCredential & { grade: number; section: { id: string; label: string } };
    }>('/students', payload);
    return res.data;
  },
  bulkCreate: async (payload: { section: string; names: string[] }) => {
    const res = await api.post<BulkStudentResponse>('/students/bulk', payload);
    return res.data;
  },
  update: async (id: string, payload: { name?: string; section?: string; isActive?: boolean }) => {
    const res = await api.put<{ success: boolean; data: Student }>(`/students/${id}`, payload);
    return res.data;
  },
  resetPassword: async (id: string) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { username: string; password: string };
    }>(`/students/${id}/reset-password`);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
};