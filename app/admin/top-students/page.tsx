'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { topStudentService } from '@/services/topStudentService';
import type { TopStudent } from '@/types/landing';
import type { ApiErrorResponse } from '@/types/academic';

interface FormState {
  name: string;
  mark: string;
  grade: string;
  label: string;
  order: string;
  isPublished: boolean;
}

const emptyForm: FormState = {
  name: '',
  mark: '',
  grade: '',
  label: '',
  order: '0',
  isPublished: true,
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function TopStudentsPage() {
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TopStudent | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TopStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await topStudentService.getAll();
      setStudents(res.data);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPreviewUrl(null);
    setRemovePhoto(false);
    setModalOpen(true);
  };

  const openEdit = (s: TopStudent) => {
    setEditing(s);
    setForm({
      name: s.name,
      mark: s.mark,
      grade: s.grade || '',
      label: s.label || '',
      order: String(s.order ?? 0),
      isPublished: s.isPublished,
    });
    setPhotoFile(null);
    setPreviewUrl(s.photo?.url || null);
    setRemovePhoto(false);
    setModalOpen(true);
  };

  const onPickPhoto = (file: File | null) => {
    setPhotoFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const onRemovePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mark.trim()) {
      toast.error('Name and mark are required');
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('mark', form.mark.trim());
      fd.append('grade', form.grade.trim());
      fd.append('label', form.label.trim());
      fd.append('order', form.order || '0');
      fd.append('isPublished', String(form.isPublished));
      if (photoFile) fd.append('photo', photoFile);
      if (editing && removePhoto && !photoFile) fd.append('removePhoto', 'true');

      if (editing) {
        await topStudentService.update(editing._id, fd);
        toast.success('Student updated');
      } else {
        await topStudentService.create(fd);
        toast.success('Student added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (s: TopStudent) => {
    try {
      const fd = new FormData();
      fd.append('isPublished', String(!s.isPublished));
      await topStudentService.update(s._id, fd);
      toast.success(s.isPublished ? 'Hidden from landing page' : 'Now showing on landing page');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await topStudentService.remove(deleteTarget._id);
      toast.success('Student removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900';

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Top Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Students shown on the public landing page. Only publish with the student&apos;s and
            parent&apos;s permission.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Loading...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Trophy className="mx-auto mb-2 text-slate-300" size={32} />
          <p className="text-sm text-slate-500">No students yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <div key={s._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                {s.photo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photo.url}
                    alt={s.name}
                    className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {initialsOf(s.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{s.name}</p>
                  <p className="text-lg font-bold text-blue-700">{s.mark}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[s.grade, s.label].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    s.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.isPublished ? 'Showing' : 'Hidden'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublish(s)}
                    title={s.isPublished ? 'Hide' : 'Show'}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {s.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    title="Edit"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    title="Delete"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Student' : 'Add Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ImagePlus size={24} />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="inline-block cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                {previewUrl ? 'Change photo' : 'Upload photo (optional)'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickPhoto(e.target.files?.[0] || null)}
                />
              </label>
              {previewUrl && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="block text-xs text-red-600 hover:underline"
                >
                  Remove photo
                </button>
              )}
              <p className="text-[11px] text-slate-400">JPG, PNG or WebP, up to 5 MB</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Abebe Kebede"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mark</label>
            <input
              className={inputClass}
              value={form.mark}
              onChange={(e) => setForm({ ...form, mark: e.target.value })}
              placeholder="e.g. 98% or 612 / 700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Grade (optional)</label>
              <input
                className={inputClass}
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="Grade 12"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Note (optional)</label>
              <input
                className={inputClass}
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="2025 National Exam"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Order</label>
              <input
                type="number"
                className={inputClass}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-slate-400">Smaller number shows first</p>
            </div>
            <label className="flex items-center gap-2 pb-6 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              Show on landing page
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Add Student'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Student"
        message={`Remove "${deleteTarget?.name}" from the top students list? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}