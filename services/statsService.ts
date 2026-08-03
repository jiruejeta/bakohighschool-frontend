import api from '@/lib/axios';
import type { StatsSummary, GradeStat, SubjectStat, YearStat, RecentQuestion } from '@/types/stats';

export const statsService = {
  getSummary: async () => {
    const res = await api.get<{ success: boolean; data: StatsSummary }>('/stats/summary');
    return res.data;
  },
  getByGrade: async () => {
    const res = await api.get<{ success: boolean; data: GradeStat[] }>('/stats/by-grade');
    return res.data;
  },
  getBySubject: async () => {
    const res = await api.get<{ success: boolean; data: SubjectStat[] }>('/stats/by-subject');
    return res.data;
  },
  getByYear: async () => {
    const res = await api.get<{ success: boolean; data: YearStat[] }>('/stats/by-year');
    return res.data;
  },
  getRecent: async (limit = 5) => {
    const res = await api.get<{ success: boolean; data: RecentQuestion[] }>('/stats/recent', {
      params: { limit },
    });
    return res.data;
  },
};