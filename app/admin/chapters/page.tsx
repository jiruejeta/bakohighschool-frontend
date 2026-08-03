'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { chapterService } from '@/services/chapterService';
import { subjectService } from '@/services/subjectService';
import { chapterSchema, type ChapterFormValues } from '@/lib/validations/academicSchema';
import type { Chapter, Subject, ApiErrorResponse } from '@/types/academic';

const GRADES = [9, 10, 11, 12];

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChapterFormValues>({ resolver: zodResolver(chapterSchema) });

  const loadSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    }
  }, []);

  const loadChapters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await chapterService.getAll({
        subject: filterSubject || undefined,
        grade: filterGrade ? Number(filterGrade) : undefined,
      });
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  }, [filterSubject, filterGrade]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', subject: '', grade: 9, order: 0 });
    setModalOpen(true);
  };

  const openEdit = (chapter: Chapter) => {
    setEditing(chapter);
    const subjectId = chapter.subject
      ? typeof chapter.subject === 'string'
        ? chapter.subject
        : chapter.subject._id
      : '';
    reset({ title: chapter.title, subject: subjectId, grade: chapter.grade, order: chapter.order });
    setModalOpen(true);
  };

  const onSubmit = async (values: ChapterFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        title: values.title,
        subject: values.subject,
        grade: Number(values.grade),
        order: values.order !== undefined ? Number(values.order) : undefined,
      };

      if (editing) {
        await chapterService.update(editing._id, payload);
        toast.success('Chapter updated');
      } else {
        await chapterService.create(payload);
        toast.success('Chapter created');
      }
      setModalOpen(false);
      loadChapters();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await chapterService.remove(deleteTarget._id);
      toast.success('Chapter deleted');
      setDeleteTarget(null);
      loadChapters();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chapters</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Each chapter belongs to a Subject and a Grade.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800 shrink-0"
        >
          <Plus size={16} />
          Add Chapter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">All Grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : chapters.length === 0 ? (
          <div className="p-10 text-center">
            <Layers className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No chapters found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Title</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Subject</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Grade</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3 hidden sm:table-cell">
                    Order
                  </th>
                  <th className="text-right font-medium text-slate-600 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{chapter.title}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {chapter.subject ? (
                        typeof chapter.subject === 'string' ? (
                          chapter.subject
                        ) : (
                          chapter.subject.name
                        )
                      ) : (
                        <span className="text-red-500 italic">Subject deleted</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">Grade {chapter.grade}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{chapter.order}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(chapter)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(chapter)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Chapter' : 'Add Chapter'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              {...register('title')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. Chapter 1: Cell Structure"
            />
            {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <select
              {...register('subject')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1.5 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade</label>
              <select
                {...register('grade')}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="mt-1.5 text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Order (optional)
              </label>
              <input
                type="number"
                {...register('order')}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editing ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Chapter"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}