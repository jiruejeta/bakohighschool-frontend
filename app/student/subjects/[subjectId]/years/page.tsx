'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentBrowseService } from '@/services/studentBrowseService';
import type { BrowseYear } from '@/types/studentBrowse';

export default function StudentYearsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const [years, setYears] = useState<BrowseYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentBrowseService.getYears();
      setYears(res.data);
    } catch {
      toast.error('Failed to load exam years');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <button
        onClick={() => router.push('/student/subjects')}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Subjects
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-950">Choose a Year</h1>
        <p className="text-blue-500/80 mt-1 text-sm">
          Select a previous national exam year to continue.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-400 text-sm py-10">Loading...</div>
      ) : years.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
          <Calendar className="mx-auto text-blue-200 mb-2" size={32} />
          <p className="text-blue-400 text-sm">No exam years available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => (
            <Link
              key={year._id}
              href={`/student/subjects/${subjectId}/years/${year._id}`}
              className="bg-white rounded-2xl border border-blue-100 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-400 flex items-center justify-center shadow-sm">
                  <Calendar size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {year.title || `${year.year} National Exam`}
                  </p>
                  <p className="text-xs text-blue-400 mt-0.5">{year.year}</p>
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