export interface StatsSummary {
  totalQuestions: number;
  totalSubjects: number;
  totalChapters: number;
  totalGrades: number;
  totalNationalExams: number;
}

export interface GradeStat {
  grade: number;
  count: number;
}

export interface SubjectStat {
  subjectId: string;
  name: string;
  count: number;
}

export interface YearStat {
  nationalExamId: string;
  year: number;
  count: number;
}

export interface RecentQuestion {
  _id: string;
  questionNumber: number;
  questionText: string;
  grade: number;
  subject: { _id: string; name: string } | string;
  chapter: { _id: string; title: string } | string;
  status: 'draft' | 'published';
  createdAt: string;
}