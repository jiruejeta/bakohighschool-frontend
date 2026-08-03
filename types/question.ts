export interface CloudinaryFile {
  url: string | null;
  publicId: string | null;
}

export interface Question {
  _id: string;
  grade: number;
  subject: { _id: string; name: string } | string;
  chapter: { _id: string; title: string } | string;
  nationalExam?: { _id: string; year: number; title: string } | string | null;
  questionNumber: number;
  questionText: string;
  questionImage?: CloudinaryFile;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanationImage?: CloudinaryFile;
  explanationVideoUrl?: string | null;
  explanationVideoFile?: CloudinaryFile;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface QuestionListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Question[];
}

export interface QuestionItemResponse {
  success: boolean;
  data: Question;
}

export interface BulkQuestionInput {
  questionNumber: number;
  questionText: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  createdCount: number;
  failed: { row: number; questionNumber?: number; reason: string }[];
}