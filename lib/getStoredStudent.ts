import Cookies from 'js-cookie';
import type { StudentProfile } from '@/types/student';

export function getStoredStudent(): StudentProfile | null {
  const raw = Cookies.get('bako_student');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}