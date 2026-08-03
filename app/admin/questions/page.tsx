'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Upload, Pencil, Trash2, HelpCircle, Search, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import BulkVideoModal from '@/components/admin/BulkVideoModal';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { nationalExamService } from '@/services/nationalExamService';
import type { Question } from '@/types/question';
import type { Subject, NationalExam, ApiErrorResponse } from '@/types/academic';

const GRADES = [9, 10, 11, 12];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [nationalExam, setNationalExam] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkVideoModalOpen, setBulkVideoModalOpen] = useState(false);

  const loadFilters = useCallback(async () => {
    try {
      const [subRes, examRes] = await Promise.all([
        subjectService.getAll(),
        nationalExamService.getAll(),
      ]);
      setSubjects(subRes.data);
      setNationalExams(examRes.data);
    } catch {
      toast.error('Failed to load filters');
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await questionService.getAll({
        grade: grade ? Number(grade) : undefined,
        subject: subject || undefined,
        nationalExam: nationalExam || undefined,
        status: status || undefined,
        keyword: keyword || undefined,
        page,
        limit: 20,
      });
      setQuestions(res.data);
      setTotalPages(res.totalPages);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [grade, subject, nationalExam, status, keyword, page]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await questionService.remove(deleteTarget._id);
      toast.success('Question deleted');
      setDeleteTarget(null);
      loadQuestions();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const subjectName = (s: Question['subject']) => (typeof s === 'string' ? s : s?.name || '—');
  const chapterTitle = (c: Question['chapter']) => (typeof c === 'string' ? c : c?.title || '—');

  const allSelected = questions.length > 0 && selectedIds.length === questions.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : questions.map((q) => q._id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage the full exam question bank.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/questions/bulk"
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <Upload size={16} />
            Bulk Upload
          </Link>
          <Link
            href="/admin/questions/new"
            className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
          >
            <Plus size={16} />
            Add Question
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setPage(1);
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
            setPage(1);
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
          value={nationalExam}
          onChange={(e) => {
            setNationalExam(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <div className="relative col-span-2 sm:col-span-1 lg:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="Search keyword..."
            className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900 text-white rounded-lg px-4 py-3 mb-4">
          <p className="text-sm">
            <span className="font-semibold">{selectedIds.length}</span> question(s) selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkVideoModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-slate-900 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
            >
              <Video size={15} />
              Attach Video
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-slate-300 hover:text-white px-3 py-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="p-10 text-center">
            <HelpCircle className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No questions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3">#</th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3">Question</th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3 hidden md:table-cell">
                    Grade
                  </th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3 hidden md:table-cell">
                    Subject
                  </th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3 hidden lg:table-cell">
                    Chapter
                  </th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3 hidden sm:table-cell">
                    Video
                  </th>
                  <th className="text-left font-medium text-slate-600 px-4 py-3">Status</th>
                  <th className="text-right font-medium text-slate-600 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => {
                  const hasVideo = !!(q.explanationVideoUrl || q.explanationVideoFile?.url);
                  return (
                    <tr key={q._id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(q._id)}
                          onChange={() => toggleSelectOne(q._id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{q.questionNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                        {q.questionText}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                        Grade {q.grade}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                        {subjectName(q.subject)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        {chapterTitle(q.chapter)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {hasVideo ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                            Has video
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            q.status === 'published'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/questions/${q._id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(q)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Question"
        message={`Are you sure you want to delete question #${deleteTarget?.questionNumber}? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <BulkVideoModal
        isOpen={bulkVideoModalOpen}
        onClose={() => setBulkVideoModalOpen(false)}
        selectedIds={selectedIds}
        onSuccess={loadQuestions}
      />
    </div>
  );
}