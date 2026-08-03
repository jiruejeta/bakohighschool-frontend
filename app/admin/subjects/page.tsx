'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { subjectService } from '@/services/subjectService';
import { subjectSchema, type SubjectFormValues } from '@/lib/validations/academicSchema';
import type { Subject, ApiErrorResponse } from '@/types/academic';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({ resolver: zodResolver(subjectSchema) });

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    reset({ name: subject.name, description: subject.description });
    setModalOpen(true);
  };

  const onSubmit = async (values: SubjectFormValues) => {
    setIsSaving(true);
    try {
      if (editing) {
        await subjectService.update(editing._id, values);
        toast.success('Subject updated');
      } else {
        await subjectService.create(values);
        toast.success('Subject created');
      }
      setModalOpen(false);
      loadSubjects();
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
      await subjectService.remove(deleteTarget._id);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      loadSubjects();
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
          <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage subjects like Biology, Chemistry, Physics, etc.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No subjects yet. Add your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Name</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3 hidden sm:table-cell">
                    Description
                  </th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Status</th>
                  <th className="text-right font-medium text-slate-600 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{subject.name}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">
                      {subject.description || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          subject.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(subject)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(subject)}
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
        title={editing ? 'Edit Subject' : 'Add Subject'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. Biology"
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Short description"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editing ? 'Update Subject' : 'Create Subject'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}