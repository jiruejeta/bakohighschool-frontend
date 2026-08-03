'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { getStoredStudent } from '@/lib/getStoredStudent';
import type { StudentProfile } from '@/types/student';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useStudentAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    setStudent(getStoredStudent());
  }, []);

  if (pathname === '/student/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-white">
      <header className="bg-white/90 backdrop-blur border-b border-blue-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/student/subjects" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm shadow-blue-200">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="text-sm font-semibold text-blue-950 hidden sm:inline">
              Bako High School
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {student && (
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-medium text-blue-950">{student.name}</p>
                <p className="text-xs text-blue-500">Grade {student.grade}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}