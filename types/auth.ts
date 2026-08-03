export interface Admin {
  id: string;
  name: string;
  username: string;
  role: 'superadmin' | 'admin';
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: Admin;
  token: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}