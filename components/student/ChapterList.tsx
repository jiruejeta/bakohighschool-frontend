import Link from 'next/link';
import { FileQuestion, ChevronRight } from 'lucide-react';
import ChapterStatusBadge from './ChapterStatusBadge';
import type { ChapterStatus } from '@/types/studentBrowse';

interface ChapterListProps {
  chapters: ChapterStatus[];
  getHref: (chapter: ChapterStatus) => string;
  showGradeLabel?: boolean;
}

export default function ChapterList({ chapters, getHref, showGradeLabel }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
        <FileQuestion className="mx-auto text-blue-200 mb-2" size={32} />
        <p className="text-blue-400 text-sm">No questions available for this selection yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden divide-y divide-blue-50">
      {chapters.map((chapter) => (
        <Link
          key={`${chapter.grade}-${chapter.chapterId}`}
          href={getHref(chapter)}
          className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-blue-50/60 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-950 truncate">
              {showGradeLabel ? `Grade ${chapter.grade} — ${chapter.title}` : chapter.title}
            </p>
            <p className="text-xs text-blue-400 mt-0.5">
              {chapter.totalQuestions} question{chapter.totalQuestions !== 1 ? 's' : ''}
              {chapter.attemptedCount > 0 &&
                ` · ${chapter.correctCount}/${chapter.attemptedCount} correct`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ChapterStatusBadge status={chapter.status} />
            <ChevronRight size={16} className="text-blue-200" />
          </div>
        </Link>
      ))}
    </div>
  );
}