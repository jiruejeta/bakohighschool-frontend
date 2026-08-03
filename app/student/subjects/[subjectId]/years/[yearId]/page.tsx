'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, ChevronRight, Layers3 } from 'lucide-react';

const GRADES = [9, 10, 11, 12];

export default function StudentGradeSelectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const yearId = params.yearId as string;

  return (
    <div>
      <button
        onClick={() => router.push(`/student/subjects/${subjectId}/years`)}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Years
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-950">Choose a Grade</h1>
        <p className="text-blue-500/80 mt-1 text-sm">
          Pick a specific grade, or view the combined full-subject exam across all grades.
        </p>
      </div>

      <Link
        href={`/student/subjects/${subjectId}/years/${yearId}/full`}
        className="block bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 text-white rounded-2xl p-5 mb-6 hover:shadow-lg hover:shadow-blue-200 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Layers3 size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold">Full Subject — All Grades</p>
              <p className="text-xs text-blue-100 mt-0.5">
                Grade 9 Chapter 1 through Grade 12&apos;s last chapter, combined
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-blue-200" />
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GRADES.map((grade) => (
          <Link
            key={grade}
            href={`/student/subjects/${subjectId}/years/${yearId}/grade/${grade}`}
            className="bg-white rounded-2xl border border-blue-100 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <GraduationCap size={19} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-blue-950">Grade {grade}</p>
            </div>
            <ChevronRight size={18} className="text-blue-200" />
          </Link>
        ))}
      </div>
    </div>
  );
}