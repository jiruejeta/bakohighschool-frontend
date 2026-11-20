'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Plus, Smartphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { appReleaseService } from '@/services/appReleaseService';
import type { AppRelease } from '@/types/landing';
import type { ApiErrorResponse } from '@/types/academic';

const emptyForm = { version: '', downloadUrl: '', sizeMb: '', notes: '' };

export default function AppReleasesPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppRelease | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await appReleaseService.getAll();
      setReleases(res.data);
    } catch {
      toast.error('Failed to load app releases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The newest active release is the one shown on the landing page
  const currentId = releases.find((r) => r.isActive)?._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.version.trim() || !form.downloadUrl.trim()) {
      toast.error('Version and download link are required');
      return;
    }
    setIsSaving(true);
    try {
      await appReleaseService.create({
        version: form.version.trim(),
        downloadUrl: form.downloadUrl.trim(),
        sizeMb: form.sizeMb.trim(),
        notes: form.notes.trim(),
      });
      toast.success('App release published');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const first = axiosErr.response?.data?.errors?.[0]?.message;
      toast.error(first || axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (r: AppRelease) => {
    try {
      await appReleaseService.update(r._id, { isActive: !r.isActive });
      toast.success(r.isActive ? 'Release hidden' : 'Release activated');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await appReleaseService.remove(deleteTarget._id);
      toast.success('Release deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
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
          <h1 className="text-2xl font-bold text-slate-900">App Releases</h1>
          <p className="mt-1 text-sm text-slate-500">
            The newest active release is the Download button on the landing page.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          New Release
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        Paste a direct link to the APK file. Upload the APK to a GitHub Release (free, files up to 2 GB) and
        copy the file link, for example
        <span className="font-mono"> https://github.com/you/repo/releases/download/v1.0/app.apk</span>.
        Open the link yourself first to confirm it downloads.
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
        ) : releases.length === 0 ? (
          <div className="p-10 text-center">
            <Smartphone className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm text-slate-500">No releases yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {releases.map((r) => (
              <div key={r._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">Version {r.version}</p>
                    {r._id === currentId && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Shown on website
                      </span>
                    )}
                    {!r.isActive && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                    {r.sizeMb ? ` · ${r.sizeMb} MB` : ''}
                    {r.notes ? ` · ${r.notes}` : ''}
                  </p>
                  <a
                    href={r.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink size={12} />
                    <span className="truncate">{r.downloadUrl}</span>
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleActive(r)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {r.isActive ? 'Hide' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New App Release">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Version</label>
            <input
              className={inputClass}
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="e.g. 1.0.2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">APK download link</label>
            <input
              className={inputClass}
              value={form.downloadUrl}
              onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Size in MB (optional)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={form.sizeMb}
                onChange={(e) => setForm({ ...form, sizeMb: e.target.value })}
                placeholder="118"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">What&apos;s new (optional)</label>
              <input
                className={inputClass}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Images now work offline"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Publishing...' : 'Publish Release'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Release"
        message={`Delete version ${deleteTarget?.version}? This only removes it from the list. The APK file itself is not touched.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}