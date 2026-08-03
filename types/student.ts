export interface StudentProfile {
  id: string;
  name: string;
  username: string;
  grade: number;
  section?: { name: string; grade: number };
}

export interface StudentLoginPayload {
  username: string;
  password: string;
}

export interface StudentAuthResponse {
  success: boolean;
  message: string;
  data: StudentProfile;
  token: string;
}