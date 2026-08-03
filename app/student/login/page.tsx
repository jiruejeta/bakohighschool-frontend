'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Lock, User, Sparkles } from 'lucide-react';
import { useStudentAuth } from '@/hooks/useStudentAuth';

interface StudentLoginFormValues {
  username: string;
  password: string;
}

export default function StudentLoginPage() {
  const { login, isLoading } = useStudentAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm<StudentLoginFormValues>();

  const onSubmit = (values: StudentLoginFormValues) => {
    login(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-700 via-blue-600 to-blue-500 px-4 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-lg shadow-blue-900/30">
            <GraduationCap className="text-blue-600" size={26} />
          </div>
          <h1 className="text-xl font-bold text-white">Bako High School</h1>
          <p className="text-blue-100 text-sm flex items-center gap-1 mt-0.5">
            <Sparkles size={13} /> Student Exam Bank
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/20 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  {...register('username')}
                  autoComplete="username"
                  className="w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-blue-100 bg-blue-50/40 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-lg py-2.5 text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-blue-100 mt-6">
          Don&apos;t have an account? Ask your teacher or school admin for your login details.
        </p>
      </div>
    </div>
  );
}