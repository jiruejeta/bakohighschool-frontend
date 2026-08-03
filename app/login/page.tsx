'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, School, Lock, User } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/lib/validations/authSchema';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel - hidden on mobile, visible from lg up */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <School className="text-white" size={20} />
          </div>
          <span className="text-white font-semibold text-lg">Bako High School</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Exam Bank
            <br />
            Management System
          </h1>
          <p className="text-slate-400 mt-4 text-base max-w-md">
            Organize questions, chapters, subjects, and previous national exams
            in one centralized admin panel.
          </p>
        </div>

        <p className="relative text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Bako High School. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-3">
              <School className="text-white" size={22} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Bako High School</h1>
            <p className="text-slate-500 text-sm">Exam Bank Admin</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="mb-6 hidden lg:block">
              <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to access the admin panel.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    {...register('username')}
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Authorized personnel only. Contact the system administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}