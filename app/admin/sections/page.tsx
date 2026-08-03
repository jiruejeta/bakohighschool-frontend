'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Users, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { sectionService } from '@/services/sectionService';
import type { Section } from '@/types/studentManagement';
import type { ApiErrorResponse } from '@/types/academic';

const GRADES = [9, 10, 11, 12];

interface SectionFormValues {
  grade: number;
  name: string;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');

  const { register, handleSubmit, reset } = useForm<SectionFormValues>({
    defaultValues: { grade: 9, name: '' },
  });

  const loadSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await sectionService.getAll(filterGrade ? Number(filterGrade) : undefined);
      setSections(res.data);
    } catch {
      toast.error('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  }, [filterGrade]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const openCreate = () => {
    setEditing(null);
    reset({ grade: 9, name: '' });
    setModalOpen(true);
  };

  const openEdit = (section: Section) => {
    setEditing(section);
    reset({ grade: section.grade, name: section.name });
    setModalOpen(true);
  };

  const onSubmit = async (values: SectionFormValues) => {
    setIsSaving(true);
    try {
      const payload = { grade: Number(values.grade), name: values.name };
      if (editing) {
        await sectionService.update(editing._id, payload);
        toast.success('Section updated');
      } else {
        await sectionService.create(payload);
        toast.success('Section created');
      }
      setModalOpen(false);
      loadSections();
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
      await sectionService.remove(deleteTarget._id);
      toast.success('Section deleted');
      setDeleteTarget(null);
      loadSections();
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
          <h1 className="text-2xl font-bold text-slate-900">Sections / Classes</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Create classes like 9A, 9B, 10C, then add students inside each one.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800 shrink-0"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      <select
        value={filterGrade}
        onChange={(e) => setFilterGrade(e.target.value)}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white mb-4"
      >
        <option value="">All Grades</option>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            Grade {g}
          </option>
        ))}
      </select>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          Loading...
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <GraduationCap className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-slate-500 text-sm">No sections yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div
              key={section._id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{section.label}</p>
                  <p className="text-xs text-slate-500">Grade {section.grade}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    section.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {section.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-4">
                <Users size={15} />
                {section.studentCount} student{section.studentCount !== 1 ? 's' : ''}
              </div>

              <div className="mt-auto flex gap-2">
                <Link
                  href={`/admin/students?section=${section._id}`}
                  className="flex-1 text-center rounded-lg border border-slate-300 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  View Students
                </Link>
                <button
                  onClick={() => openEdit(section)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(section)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Section' : 'Add Section'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade</label>
            <select
              {...register('grade')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Section Name
            </label>
            <input
              {...register('name')}
              maxLength={5}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm uppercase"
              placeholder="e.g. A, B, C, D"
            />
            <p className="text-xs text-slate-400 mt-1">
              This will display as e.g. &quot;9D&quot; when combined with the grade.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editing ? 'Update Section' : 'Create Section'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Section"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This only works if no students are assigned to it.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}