import publicApi from '@/lib/publicAxios';
import type { PublicTopStudent, PublicAppRelease } from '@/types/landing';

export const landingService = {
  getTopStudents: async () => {
    const res = await publicApi.get<{ success: boolean; data: PublicTopStudent[] }>(
      '/public/top-students'
    );
    return res.data;
  },
  getAppRelease: async () => {
    const res = await publicApi.get<{ success: boolean; data: PublicAppRelease | null }>(
      '/public/app-release'
    );
    return res.data;
  },
};