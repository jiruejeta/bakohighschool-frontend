import api from '@/lib/axios';
import type { AppRelease } from '@/types/landing';

export interface AppReleasePayload {
  version: string;
  downloadUrl: string;
  notes?: string;
  sizeMb?: string;
}

export const appReleaseService = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: AppRelease[] }>('/app-releases');
    return res.data;
  },
  create: async (payload: AppReleasePayload) => {
    const res = await api.post<{ success: boolean; data: AppRelease }>('/app-releases', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<AppReleasePayload> & { isActive?: boolean }) => {
    const res = await api.put<{ success: boolean; data: AppRelease }>(
      `/app-releases/${id}`,
      payload
    );
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/app-releases/${id}`);
    return res.data;
  },
};