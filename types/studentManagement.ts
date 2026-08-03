export interface Section {
  _id: string;
  grade: number;
  name: string;
  label: string;
  studentCount: number;
  isActive: boolean;
}

export interface Student {
  _id: string;
  name: string;
  username: string;
  grade: number;
  section: { _id: string; name: string; grade: number } | string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatedStudentCredential {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface BulkStudentResponse {
  success: boolean;
  message: string;
  section: { id: string; label: string; grade: number };
  createdCount: number;
  students: CreatedStudentCredential[];
  failed: { row: number; name?: string; reason: string }[];
}