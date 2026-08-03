'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Timer, Layers3 } from 'lucide-react';
import toast from 'react-hot-toast';
import ChapterList from '@/components/student/ChapterList';
import { studentBrowseService } from '@/services/studentBrowseService';
import type { ChapterStatus, FullChaptersSummary } from '@/types/studentBrowse';

export default function StudentFullSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const yearId = params.yearId as string;

  const [chapters, setChapters] = useState<ChapterStatus[]>([]);
  const [summary, setSummary] = useState<FullChaptersSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentBrowseService.getFullChapters(subjectId, yearId);
      setChapters(res.data);
      setSummary(res.summary);
    } catch {
      toast.error('Failed to load full subject exam');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, yearId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <button
        onClick={() => router.push(`/student/subjects/${subjectId}/years/${yearId}`)}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Grades
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Full Subject Exam</h1>
          <p className="text-blue-500/80 mt-1 text-sm">
            All chapters from Grade 9 to Grade 12 combined for this year.
          </p>
        </div>
        {summary && summary.totalQuestions > 0 && (
          <button
            onClick={() => router.push(`/student/subjects/${subjectId}/years/${yearId}/full/exam`)}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-700 to-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:shadow-lg hover:shadow-blue-200 transition-all shrink-0"
          >
            <Timer size={16} />
            Start Full Exam ({summary.totalQuestions} questions)
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center text-blue-400 text-sm py-10">Loading...</div>
      ) : chapters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
          <Layers3 className="mx-auto text-blue-200 mb-2" size={32} />
          <p className="text-blue-400 text-sm">
            No questions available across any grade for this subject and year yet.
          </p>
        </div>
      ) : (
        <>
          {summary && (
            <div className="bg-white rounded-2xl border border-blue-100 p-4 mb-4 flex items-center gap-6 text-sm">
              <div>
                <span className="text-blue-400">Total: </span>
                <span className="font-semibold text-blue-950">{summary.totalQuestions}</span>
              </div>
              <div>
                <span className="text-blue-400">Attempted: </span>
                <span className="font-semibold text-blue-950">{summary.attemptedCount}</span>
              </div>
              <div>
                <span className="text-blue-400">Correct: </span>
                <span className="font-semibold text-emerald-600">{summary.correctCount}</span>
              </div>
            </div>
          )}
          <ChapterList
            chapters={chapters}
            showGradeLabel
            getHref={(c) =>
              `/student/subjects/${subjectId}/years/${yearId}/grade/${c.grade}/chapter/${c.chapterId}`
            }
          />
        </>
      )}
    </div>
  );
}