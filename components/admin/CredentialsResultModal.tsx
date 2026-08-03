'use client';

import { Download, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { exportStudentCredentialsToExcel } from '@/lib/exportExcel';
import type { CreatedStudentCredential } from '@/types/studentManagement';

interface CredentialsResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  students: CreatedStudentCredential[];
  failed?: { row: number; name?: string; reason: string }[];
}

export default function CredentialsResultModal({
  isOpen,
  onClose,
  className,
  students,
  failed = [],
}: CredentialsResultModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (username: string, password: string, id: string) => {
    navigator.clipboard.writeText(`Username: ${username}\nPassword: ${password}`);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    exportStudentCredentialsToExcel(className, students);
    toast.success('Excel file downloaded');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Credentials">
      <div className="space-y-4">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
          <p className="text-xs text-amber-800">
            Save these now — passwords are shown only once and cannot be retrieved later
            (only reset).
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                <p className="text-xs text-slate-500">
                  <span className="font-mono">{s.username}</span> ·{' '}
                  <span className="font-mono">{s.password}</span>
                </p>
              </div>
              <button
                onClick={() => handleCopy(s.username, s.password, s.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg shrink-0"
              >
                {copiedId === s.id ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          ))}
        </div>

        {failed.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-3">
            <p className="text-xs font-semibold text-red-700 mb-1">
              {failed.length} row(s) failed:
            </p>
            {failed.map((f, i) => (
              <p key={i} className="text-xs text-red-600">
                Row {f.row}{f.name ? ` (${f.name})` : ''}: {f.reason}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
    </Modal>
  );
}