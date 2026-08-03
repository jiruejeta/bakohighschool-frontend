'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionPreviewCard from '@/components/admin/QuestionPreviewCard';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { chapterService } from '@/services/chapterService';
import { nationalExamService } from '@/services/nationalExamService';
import type { Question } from '@/types/question';
import type { Subject, Chapter, NationalExam } from '@/types/academic';

const GRADES = [9, 10, 11, 12];

export default function SearchPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExam[]>([]);

  const [keyword, setKeyword] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [nationalExam, setNationalExam] = useState('');
  const [status, setStatus] = useState('');

  const [results, setResults] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadFilterOptions = useCallback(async () => {
    try {
      const [subRes, examRes] = await Promise.all([
        subjectService.getAll(),
        nationalExamService.getAll(),
      ]);
      setSubjects(subRes.data);
      setNationalExams(examRes.data);
    } catch {
      toast.error('Failed to load filter options');
    }
  }, []);

  const loadChapters = useCallback(async () => {
    if (!subject) {
      setChapters([]);
      return;
    }
    try {
      const res = await chapterService.getAll({
        subject,
        grade: grade ? Number(grade) : undefined,
      });
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    }
  }, [subject, grade]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const runSearch = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await questionService.getAll({
          keyword: keyword || undefined,
          grade: grade ? Number(grade) : undefined,
          subject: subject || undefined,
          chapter: chapter || undefined,
          nationalExam: nationalExam || undefined,
          status: status || undefined,
          page: targetPage,
          limit: 15,
        });
        setResults(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setPage(res.page);
      } catch {
        toast.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [keyword, grade, subject, chapter, nationalExam, status]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setGrade('');
    setSubject('');
    setChapter('');
    setNationalExam('');
    setStatus('');
  };

  const activeFilterCount = [grade, subject, chapter, nationalExam, status].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search Questions</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Search by Grade, Subject, Chapter, National Exam Year, or keyword.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keyword (question text or explanation)..."
              className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium shrink-0 ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white/20 rounded-full text-xs px-1.5">{activeFilterCount}</span>
            )}
          </button>
          <button
            type="submit"
            className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 shrink-0"
          >
            Search
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-3 bg-white rounded-xl border border-slate-200 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setChapter('');
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">All Grades</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>

              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setChapter('');
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                disabled={!subject}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white disabled:opacity-50"
              >
                <option value="">{subject ? 'All Chapters' : 'Select subject first'}</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={nationalExam}
                onChange={(e) => setNationalExam(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">All Years</option>
                {nationalExams.map((ne) => (
                  <option key={ne._id} value={ne._id}>
                    {ne.year}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 mt-3"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </form>

      {!hasSearched ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <SearchIcon className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-500 text-sm">
            Enter a keyword or apply filters, then click Search.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">No questions matched your search.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-3">
            {total} result{total !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {results.map((q) => (
              <QuestionPreviewCard key={q._id} question={q} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => runSearch(page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => runSearch(page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}