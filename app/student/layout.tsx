// lib/getStoredStudent.ts
import Cookies from 'js-cookie';
import type { StudentProfile } from '@/types/student';

export function getStoredStudent(): StudentProfile | null {
  try {
    const studentData = Cookies.get('bako_student_data');
    if (studentData) {
      return JSON.parse(studentData);
    }
    return null;
  } catch {
    return null;
  }
}