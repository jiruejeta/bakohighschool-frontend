'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentBrowseService } from '@/services/studentBrowseService';
import type { BrowseSubject } from '@/types/studentBrowse';

const ICON_BG = [
  'from-blue-500 to-blue-400',
  'from-indigo-500 to-blue-400',
  'from-sky-500 to-blue-400',
  'from-blue-600 to-indigo-400',
];

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<BrowseSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentBrowseService.getSubjects();
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-950">Choose a Subject</h1>
        <p className="text-blue-500/80 mt-1 text-sm">
          Select a subject to browse previous national exams and practice questions.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-400 text-sm py-10">Loading...</div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
          <BookOpen className="mx-auto text-blue-200 mb-2" size={32} />
          <p className="text-blue-400 text-sm">No subjects available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, i) => (
            <Link
              key={subject._id}
              href={`/student/subjects/${subject._id}/years`}
              className="bg-white rounded-2xl border border-blue-100 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${ICON_BG[i % ICON_BG.length]} flex items-center justify-center shadow-sm`}
                >
                  <BookOpen size={19} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950">{subject.name}</p>
                  {subject.description && (
                    <p className="text-xs text-blue-400 mt-0.5">{subject.description}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-blue-200" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}