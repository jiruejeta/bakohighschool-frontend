import studentApi from '@/lib/studentAxios';
import type { BrowseSubject, BrowseYear, ChapterStatus, FullChaptersSummary } from '@/types/studentBrowse';

export const studentBrowseService = {
  getSubjects: async () => {
    const res = await studentApi.get<{ success: boolean; data: BrowseSubject[] }>(
      '/student/subjects'
    );
    return res.data;
  },
  getYears: async () => {
    const res = await studentApi.get<{ success: boolean; data: BrowseYear[] }>('/student/years');
    return res.data;
  },
  getChapters: async (subject: string, year: string, grade: number) => {
    const res = await studentApi.get<{ success: boolean; data: ChapterStatus[] }>(
      '/student/chapters',
      { params: { subject, year, grade } }
    );
    return res.data;
  },
  getFullChapters: async (subject: string, year: string) => {
    const res = await studentApi.get<{
      success: boolean;
      summary: FullChaptersSummary;
      data: ChapterStatus[];
    }>('/student/full-chapters', { params: { subject, year } });
    return res.data;
  },
};