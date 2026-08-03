import type { ChapterStatusValue } from '@/types/studentBrowse';

const STYLES: Record<ChapterStatusValue, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-blue-50 text-blue-500' },
  needs_review: { label: 'Needs Review', className: 'bg-rose-50 text-rose-600' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600' },
};

export default function ChapterStatusBadge({ status }: { status: ChapterStatusValue }) {
  const style = STYLES[status];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}