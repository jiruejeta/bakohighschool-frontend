'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Upload,
  Trash2,
  RotateCcw,
  Users as UsersIcon,
  Search,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CredentialsResultModal from '@/components/admin/CredentialsResultModal';
import { sectionService } from '@/services/sectionService';
import { studentManagementService } from '@/services/studentManagementService';
import { exportStudentCredentialsToExcel } from '@/lib/exportExcel';
import type { Section, Student, CreatedStudentCredential } from '@/types/studentManagement';
import type { ApiErrorResponse } from '@/types/academic';

interface SingleFormValues {
  name: string;
  section: string;
}

function StudentsPageInner() {
  const searchParams = useSearchParams();
  const preselectedSection = searchParams.get('section') || '';

  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterSection, setFilterSection] = useState(preselectedSection);
  const [keyword, setKeyword] = useState('');

  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSection, setBulkSection] = useState(preselectedSection);
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultClassName, setResultClassName] = useState('');
  const [resultStudents, setResultStudents] = useState<CreatedStudentCredential[]>([]);
  const [resultFailed, setResultFailed] = useState<{ row: number; name?: string; reason: string }[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState<Student | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { register, handleSubmit, reset } = useForm<SingleFormValues>({
    defaultValues: { name: '', section: preselectedSection },
  });

  const loadSections = useCallback(async () => {
    try {
      const res = await sectionService.getAll();
      setSections(res.data);
    } catch {
      toast.error('Failed to load sections');
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentManagementService.getAll({
        section: filterSection || undefined,
        keyword: keyword || undefined,
      });
      setStudents(res.data);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [filterSection, keyword]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const sectionLabel = (id: string) => {
    const s = sections.find((sec) => sec._id === id);
    return s ? s.label : '';
  };

  const openSingle = () => {
    reset({ name: '', section: filterSection || sections[0]?._id || '' });
    setSingleModalOpen(true);
  };

  const onSubmitSingle = async (values: SingleFormValues) => {
    setIsSubmittingSingle(true);
    try {
      const res = await studentManagementService.create(values);
      toast.success('Student created');
      setSingleModalOpen(false);
      setResultClassName(sectionLabel(values.section));
      setResultStudents([
        { id: res.data.id, name: res.data.name, username: res.data.username, password: res.data.password },
      ]);
      setResultFailed([]);
      setResultModalOpen(true);
      loadStudents();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  const openBulk = () => {
    setBulkSection(filterSection || sections[0]?._id || '');
    setBulkText('');
    setBulkModalOpen(true);
  };

  const handleBulkSubmit = async () => {
    if (!bulkSection) {
      toast.error('Select a section');
      return;
    }
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length === 0) {
      toast.error('Paste at least one student name');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const res = await studentManagementService.bulkCreate({ section: bulkSection, names });
      toast.success(res.message);
      setBulkModalOpen(false);
      setResultClassName(res.section.label);
      setResultStudents(res.students);
      setResultFailed(res.failed);
      setResultModalOpen(true);
      loadStudents();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Bulk creation failed');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await studentManagementService.remove(deleteTarget._id);
      toast.success('Student deleted');
      setDeleteTarget(null);
      loadStudents();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmReset = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    try {
      const res = await studentManagementService.resetPassword(resetTarget._id);
      toast.success('Password reset');
      setResetTarget(null);
      const sectionId =
        typeof resetTarget.section === 'string' ? resetTarget.section : resetTarget.section._id;
      setResultClassName(sectionLabel(sectionId));
      setResultStudents([
        { id: resetTarget._id, name: resetTarget.name, username: res.data.username, password: res.data.password },
      ]);
      setResultFailed([]);
      setResultModalOpen(true);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const sectionDisplay = (sec: Student['section']) => {
    if (typeof sec === 'string') return sectionLabel(sec);
    return `${sec.grade}${sec.name}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add students one at a time or in bulk. Credentials are auto-generated.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openBulk}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <Upload size={16} />
            Bulk Add
          </button>
          <button
            onClick={openSingle}
            className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s._id} value={s._id}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <UsersIcon className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 text-sm">No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Name</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Username</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Class</th>
                  <th className="text-left font-medium text-slate-600 px-5 py-3">Status</th>
                  <th className="text-right font-medium text-slate-600 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{s.username}</td>
                    <td className="px-5 py-3 text-slate-500">{sectionDisplay(s.section)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          s.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setResetTarget(s)}
                          title="Reset password"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Single Add Modal */}
      <Modal isOpen={singleModalOpen} onClose={() => setSingleModalOpen(false)} title="Add Student">
        <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              placeholder="e.g. Abebe Kebede"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
            <select
              {...register('section')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400">
            Username and password will be generated automatically.
          </p>
          <button
            type="submit"
            disabled={isSubmittingSingle}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmittingSingle ? 'Creating...' : 'Create Student'}
          </button>
        </form>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Add Students">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
            <select
              value={bulkSection}
              onChange={(e) => setBulkSection(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Paste Student Names (one per line)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
              placeholder={'Abebe Kebede\nChaltu Tola\nDawit Alemu\nFatuma Ahmed'}
            />
            <p className="text-xs text-slate-400 mt-1">
              {bulkText.split('\n').filter((l) => l.trim()).length} name(s) entered
            </p>
          </div>
          <button
            onClick={handleBulkSubmit}
            disabled={isSubmittingBulk}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmittingBulk ? 'Creating...' : 'Create All Students'}
          </button>
        </div>
      </Modal>

      <CredentialsResultModal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        className={resultClassName}
        students={resultStudents}
        failed={resultFailed}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!resetTarget}
        title="Reset Password"
        message={`Generate a new password for "${resetTarget?.name}"? Their old password will stop working immediately.`}
        onConfirm={confirmReset}
        onCancel={() => setResetTarget(null)}
        isLoading={isResetting}
      />
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400 text-sm py-10">Loading...</div>}>
      <StudentsPageInner />
    </Suspense>
  );
}