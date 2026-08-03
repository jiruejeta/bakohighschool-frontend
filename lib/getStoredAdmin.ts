import Cookies from 'js-cookie';
import type { Admin } from '@/types/auth';

export function getStoredAdmin(): Admin | null {
  const raw = Cookies.get('bako_admin');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Admin;
  } catch {
    return null;
  }
}