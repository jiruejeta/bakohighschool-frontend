'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Pencil, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { Question } from '@/types/question';

interface QuestionPreviewCardProps {
  question: Question;
}

function getSubjectName(s: Question['subject']) {
  if (typeof s === 'string') return s;
  return s && s.name ? s.name : '—';
}

function getChapterTitle(c: Question['chapter']) {
  if (typeof c === 'string') return c;
  return c && c.title ? c.title : '—';
}

function getExamYear(e: Question['nationalExam']) {
  if (!e) return null;
  if (typeof e === 'string') return null;
  return e.year;
}

export default function QuestionPreviewCard(props: QuestionPreviewCardProps) {
  const question = props.question;
  const [expanded, setExpanded] = useState(false);
  const hasVideo = Boolean(question.explanationVideoUrl || (question.explanationVideoFile && question.explanationVideoFile.url));
  const year = getExamYear(question.nationalExam);
  const editUrl = '/admin/questions/' + question._id + '/edit';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500">
              #{question.questionNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Grade {question.grade}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {getSubjectName(question.subject)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {getChapterTitle(question.chapter)}
            </span>
            {year ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {year} National Exam
              </span>
            ) : null}
            {hasVideo ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 flex items-center gap-1">
                <PlayCircle size={11} /> Video
              </span>
            ) : null}
            <span
              className={
                question.status === 'published'
                  ? 'text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700'
                  : 'text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700'
              }
            >
              {question.status}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900">{question.questionText}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={editUrl} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <Pencil size={16} />
          </Link>
          {expanded ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {question.questionImage && question.questionImage.url && (
            <img
              src={question.questionImage.url}
              alt="Question"
              className="rounded-lg border border-slate-200 max-h-56 mb-4"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const isCorrect = question.correctAnswer === letter;
              const rowClass = isCorrect
                ? 'flex items-start gap-2 px-3 py-2 rounded-lg text-sm border bg-green-50 border-green-200 text-green-800'
                : 'flex items-start gap-2 px-3 py-2 rounded-lg text-sm border bg-slate-50 border-slate-200 text-slate-700';
              return (
                <div key={letter} className={rowClass}>
                  <span className="font-semibold shrink-0">{letter}.</span>
                  <span className="flex-1">{question.choices[letter]}</span>
                  {isCorrect && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          {question.explanation && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">Explanation</p>
              <p className="text-sm text-slate-700">{question.explanation}</p>
            </div>
          )}

          {question.explanationImage && question.explanationImage.url && (
            <img
              src={question.explanationImage.url}
              alt="Explanation"
              className="rounded-lg border border-slate-200 max-h-56 mb-4"
            />
          )}

          {question.explanationVideoUrl && (
            <a
              href={question.explanationVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <PlayCircle size={16} />
              Watch explanation video
            </a>
          )}

          {question.explanationVideoFile && question.explanationVideoFile.url && (
            <video
              controls
              src={question.explanationVideoFile.url}
              className="rounded-lg border border-slate-200 max-h-64 mt-2 w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}