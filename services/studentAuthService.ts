import studentApi from '@/lib/studentAxios';
import type { StudentAuthResponse, StudentLoginPayload } from '@/types/student';

export const studentAuthService = {
  login: async (payload: StudentLoginPayload): Promise<StudentAuthResponse> => {
    const res = await studentApi.post<StudentAuthResponse>('/student-auth/login', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await studentApi.get('/student-auth/me');
    return res.data;
  },
};