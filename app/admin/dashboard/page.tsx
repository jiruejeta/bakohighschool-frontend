'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { HelpCircle, BookOpen, Layers, GraduationCap, FileText } from 'lucide-react';
import { statsService } from '@/services/statsService';
import type { StatsSummary, GradeStat, SubjectStat, YearStat, RecentQuestion } from '@/types/stats';

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [byGrade, setByGrade] = useState<GradeStat[]>([]);
  const [bySubject, setBySubject] = useState<SubjectStat[]>([]);
  const [byYear, setByYear] = useState<YearStat[]>([]);
  const [recent, setRecent] = useState<RecentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, gradeRes, subjectRes, yearRes, recentRes] = await Promise.all([
        statsService.getSummary(),
        statsService.getByGrade(),
        statsService.getBySubject(),
        statsService.getByYear(),
        statsService.getRecent(5),
      ]);
      setSummary(summaryRes.data);
      setByGrade(gradeRes.data);
      setBySubject(subjectRes.data);
      setByYear(yearRes.data);
      setRecent(recentRes.data);
    } catch {
      // silent fail on dashboard, cards just show placeholders
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const cards = [
    { label: 'Total Questions', value: summary?.totalQuestions, icon: HelpCircle, href: '/admin/questions' },
    { label: 'Total Subjects', value: summary?.totalSubjects, icon: BookOpen, href: '/admin/subjects' },
    { label: 'Total Chapters', value: summary?.totalChapters, icon: Layers, href: '/admin/chapters' },
    { label: 'Total Grades', value: summary?.totalGrades, icon: GraduationCap, href: undefined },
    { label: 'National Exam Years', value: summary?.totalNationalExams, icon: FileText, href: '/admin/national-exams' },
  ];

  const subjectName = (s: RecentQuestion['subject']) => (typeof s === 'string' ? s : s?.name || '—');
  const chapterTitle = (c: RecentQuestion['chapter']) => (typeof c === 'string' ? c : c?.title || '—');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Welcome back to the Bako High School Exam Bank admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const content = (
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors h-full">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>
                <Icon size={16} className="text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {isLoading ? '—' : value ?? 0}
              </p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Questions by Grade</h3>
          {byGrade.every((g) => g.count === 0) ? (
            <p className="text-sm text-slate-400 py-10 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byGrade.map((g) => ({ name: `Grade ${g.grade}`, count: g.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {byGrade.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Questions by Subject</h3>
          {bySubject.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bySubject.map((s) => ({ name: s.name, count: s.count }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  width={90}
                />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {bySubject.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {byYear.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Questions by National Exam Year</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byYear.map((y) => ({ name: String(y.year), count: y.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recently Added Questions</h3>
          <Link href="/admin/questions" className="text-xs text-slate-500 hover:text-slate-900">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">No questions yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((q) => (
              <Link
                key={q._id}
                href={`/admin/questions/${q._id}/edit`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{q.questionText}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grade {q.grade} · {subjectName(q.subject)} · {chapterTitle(q.chapter)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ml-3 ${
                    q.status === 'published'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {q.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}