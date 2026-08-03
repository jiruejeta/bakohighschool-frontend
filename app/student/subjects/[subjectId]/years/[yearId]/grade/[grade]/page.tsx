'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ChapterList from '@/components/student/ChapterList';
import { studentBrowseService } from '@/services/studentBrowseService';
import type { ChapterStatus } from '@/types/studentBrowse';

export default function StudentChapterListPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const yearId = params.yearId as string;
  const grade = Number(params.grade);

  const [chapters, setChapters] = useState<ChapterStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentBrowseService.getChapters(subjectId, yearId, grade);
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, yearId, grade]);

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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-950">Grade {grade} Chapters</h1>
        <p className="text-blue-500/80 mt-1 text-sm">
          Select a chapter to start practicing. Green means fully correct, red means needs
          review, blue means not started yet.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-400 text-sm py-10">Loading...</div>
      ) : (
        <ChapterList
          chapters={chapters}
          getHref={(c) =>
            `/student/subjects/${subjectId}/years/${yearId}/grade/${grade}/chapter/${c.chapterId}`
          }
        />
      )}
    </div>
  );
}