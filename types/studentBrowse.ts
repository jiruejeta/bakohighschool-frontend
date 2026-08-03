export interface BrowseSubject {
  _id: string;
  name: string;
  description?: string;
}

export interface BrowseYear {
  _id: string;
  year: number;
  title: string;
}

export type ChapterStatusValue = 'not_started' | 'needs_review' | 'completed';

export interface ChapterStatus {
  chapterId: string;
  title: string;
  grade: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  status: ChapterStatusValue;
}

export interface FullChaptersSummary {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
}