'use client';

import { useEffect, useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getStoredAdmin } from '@/lib/getStoredAdmin';
import type { Admin } from '@/types/auth';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { logout } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setAdmin(getStoredAdmin());
  }, []);

  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-600 hover:text-slate-900"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-sm font-medium text-slate-900">
              {admin?.name || 'Admin'}
            </p>
            <p className="text-[11px] text-slate-500 capitalize">
              {admin?.role || 'admin'}
            </p>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-20">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}