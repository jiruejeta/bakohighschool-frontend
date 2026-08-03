import studentApi from '@/lib/studentAxios';
import type { QuizQuestion, AnswerFeedback, BatchResultResponse } from '@/types/studentQuiz';

export const studentQuizService = {
  getChapterQuestions: async (subject: string, year: string, grade: number, chapter: string) => {
    const res = await studentApi.get<{ success: boolean; chapterTitle: string; count: number; data: QuizQuestion[] }>(
      '/student/quiz/chapter',
      { params: { subject, year, grade, chapter } }
    );
    return res.data;
  },
  getFullExamQuestions: async (subject: string, year: string) => {
    const res = await studentApi.get<{ success: boolean; count: number; data: QuizQuestion[] }>(
      '/student/quiz/full',
      { params: { subject, year } }
    );
    return res.data;
  },
  submitAnswer: async (questionId: string, selectedAnswer: string) => {
    const res = await studentApi.post<{ success: boolean; data: AnswerFeedback }>(
      '/student/quiz/answer',
      { questionId, selectedAnswer }
    );
    return res.data;
  },
  submitBatch: async (answers: { questionId: string; selectedAnswer: string }[]) => {
    const res = await studentApi.post<BatchResultResponse>('/student/quiz/submit-batch', {
      answers,
    });
    return res.data;
  },
};