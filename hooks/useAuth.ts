'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import type { LoginPayload } from '@/types/auth';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/auth';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.login(payload);

      Cookies.set('bako_token', response.token, {
        expires: 7,
        sameSite: 'lax',
      });
      Cookies.set('bako_admin', JSON.stringify(response.data), {
        expires: 7,
        sameSite: 'lax',
      });

      toast.success('Login successful');
      router.push('/admin/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('bako_token');
    Cookies.remove('bako_admin');
    router.push('/login');
  };

  return { login, logout, isLoading };
}