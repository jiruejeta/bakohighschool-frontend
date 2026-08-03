'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { studentAuthService } from '@/services/studentAuthService';
import type { StudentLoginPayload } from '@/types/student';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: false;
  message: string;
}

export function useStudentAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (payload: StudentLoginPayload) => {
    setIsLoading(true);
    try {
      const response = await studentAuthService.login(payload);

      Cookies.set('bako_student_token', response.token, { expires: 7, sameSite: 'lax' });
      Cookies.set('bako_student', JSON.stringify(response.data), { expires: 7, sameSite: 'lax' });

      toast.success('Login successful');
      router.push('/student/subjects');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('bako_student_token');
    Cookies.remove('bako_student');
    router.push('/student/login');
  };

  return { login, logout, isLoading };
}