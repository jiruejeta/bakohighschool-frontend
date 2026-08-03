'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { nationalExamService } from '@/services/nationalExamService';
import { nationalExamSchema, type NationalExamFormValues } from '@/lib/validations/academicSchema';
import type { NationalExam, ApiErrorResponse } from '@/types/academic';

export default function NationalExamsPage() {
  const [exams, setExams] = useState<NationalExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NationalExam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NationalExam | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NationalExamFormValues>({ resolver: zodResolver(nationalExamSchema) });

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await nationalExamService.getAll();
      setExams(res.data);
    } catch {
      toast.error('Failed to load national exam years');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const openCreate = () => {
    setEditing(null);
    reset({ year: new Date().getFullYear(), title: '' });
    setModalOpen(true);
  };

  const openEdit = (exam: NationalExam) => {
    setEditing(exam);
    reset({ year: exam.year, title: exam.title });
    setModalOpen(true);
  };

  const onSubmit = async (values: NationalExamFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        year: Number(values.year),
        title: values.title,
      };

      if (editing) {
        await nationalExamService.update(editing._id, payload);
        toast.success('National exam year updated');
      } else {
        await nationalExamService.create(payload);
        toast.success('National exam year created');
      }
      setModalOpen(false);
      loadExams();
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
      await nationalExamService.remove(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      loadExams();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">National Exam Years</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage previous national exam years (2018–2025 and beyond).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Year</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No national exam years yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Year</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3 hidden sm:table-cell">
                    Title
                  </th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Status</th>
                  <th className="text-right font-medium text-slate-600 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{exam.year}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">
                      {exam.title || `${exam.year} National Exam`}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          exam.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {exam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(exam)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exam)}
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
        title={editing ? 'Edit National Exam Year' : 'Add National Exam Year'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
            <input
              type="number"
              {...register('year')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. 2025"
            />
            {errors.year && <p className="mt-1.5 text-sm text-red-600">{errors.year.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title (optional)
            </label>
            <input
              {...register('title')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. 2025 National Exam"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete National Exam Year"
        message={`Are you sure you want to delete "${deleteTarget?.year}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}