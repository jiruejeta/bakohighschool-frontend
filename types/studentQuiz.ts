export interface QuizCloudinaryFile {
  url: string | null;
  publicId: string | null;
}

export interface QuizQuestion {
  _id: string;
  questionNumber: number;
  questionText: string;
  passage?: string;
  questionImage?: QuizCloudinaryFile;
  choices: { A: string; B: string; C: string; D: string };
  grade: number;
  chapter?: { _id: string; title: string } | string;
  yourAnswer?: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect?: boolean | null;
  answered?: boolean;
}

export interface AnswerFeedback {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  passage?: string;
  explanation?: string;
  explanationImage?: QuizCloudinaryFile;
  explanationVideoUrl?: string | null;
  explanationVideoFile?: QuizCloudinaryFile;
}

export interface BatchResultItem {
  questionId: string;
  questionNumber: number;
  questionText: string;
  passage?: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  explanationImage?: QuizCloudinaryFile;
  explanationVideoUrl?: string | null;
  explanationVideoFile?: QuizCloudinaryFile;
  choices: { A: string; B: string; C: string; D: string };
  grade: number;
}

export interface BatchResultResponse {
  success: boolean;
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  scorePercent: number;
  results: BatchResultItem[];
}