export interface Subject {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Chapter {
  _id: string;
  title: string;
  subject: { _id: string; name: string } | string;
  grade: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface NationalExam {
  _id: string;
  year: number;
  title: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}