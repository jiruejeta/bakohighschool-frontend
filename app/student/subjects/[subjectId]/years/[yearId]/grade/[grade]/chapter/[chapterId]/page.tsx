'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentQuizService } from '@/services/studentQuizService';
import type { QuizQuestion, AnswerFeedback } from '@/types/studentQuiz';

export default function StudentChapterQuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectId = params.subjectId as string;
  const yearId = params.yearId as string;
  const grade = Number(params.grade);
  const chapterId = params.chapterId as string;
  const yearQuery = searchParams.get('year') || yearId;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentQuizService.getChapterQuestions(subjectId, yearQuery, grade, chapterId);
      setQuestions(res.data);
      setChapterTitle(res.chapterTitle);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, yearQuery, grade, chapterId]);

  useEffect(() => {
    load();
  }, [load]);

  const current = questions[index];

  useEffect(() => {
    if (current) {
      setSelected(current.yourAnswer || null);
      setFeedback(null);
    }
  }, [current]);

  const handleSelect = async (letter: string) => {
    if (feedback || isSubmitting || !current) return;
    setSelected(letter);
    setIsSubmitting(true);
    try {
      const res = await studentQuizService.submitAnswer(current._id, letter);
      setFeedback(res.data);
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      toast.success('You finished this chapter!');
      router.push(`/student/subjects/${subjectId}/years/${yearId}/grade/${grade}`);
    }
  };

  if (isLoading) {
    return <div className="text-center text-blue-400 text-sm py-10">Loading...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
        <p className="text-blue-400 text-sm">No questions found for this chapter.</p>
      </div>
    );
  }

  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/student/subjects/${subjectId}/years/${yearId}/grade/${grade}`)}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Chapters
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-blue-950">{chapterTitle}</h1>
        <span className="text-sm text-blue-500 font-medium">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full h-1.5 bg-blue-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
        <p className="text-xs font-medium text-blue-400 mb-2">Question {current.questionNumber}</p>

        {current.passage ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-blue-500 mb-1.5">Reading Passage</p>
            <p className="text-sm text-blue-900/80 whitespace-pre-wrap">{current.passage}</p>
          </div>
        ) : null}

        <p className="text-base font-medium text-blue-950 mb-4">{current.questionText}</p>

        {current.questionImage?.url && (
          <img
            src={current.questionImage.url}
            alt="Question"
            className="rounded-xl border border-blue-100 max-h-64 mb-4"
          />
        )}

        <div className="space-y-2.5">
          {letters.map((letter) => {
            const isSelected = selected === letter;
            const isCorrectChoice = feedback && feedback.correctAnswer === letter;
            const isWrongSelected = feedback && isSelected && !feedback.isCorrect;

            let styleClass = 'border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-950';
            if (feedback) {
              if (isCorrectChoice) {
                styleClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
              } else if (isWrongSelected) {
                styleClass = 'border-rose-300 bg-rose-50 text-rose-800';
              } else {
                styleClass = 'border-blue-50 bg-white text-blue-400';
              }
            } else if (isSelected) {
              styleClass = 'border-blue-500 bg-blue-100 text-blue-950';
            }

            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                disabled={!!feedback || isSubmitting}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-all ${styleClass} ${
                  !feedback ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="font-semibold w-5 shrink-0">{letter}</span>
                <span className="flex-1">{current.choices[letter]}</span>
                {feedback && isCorrectChoice && (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                )}
                {feedback && isWrongSelected && (
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`mt-5 rounded-xl p-4 ${
              feedback.isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
            }`}
          >
            <p
              className={`text-sm font-semibold mb-1.5 ${
                feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            {feedback.explanation && (
              <p className="text-sm text-blue-900/80">{feedback.explanation}</p>
            )}
            {feedback.explanationImage?.url && (
              <img
                src={feedback.explanationImage.url}
                alt="Explanation"
                className="rounded-lg border border-blue-100 max-h-56 mt-3"
              />
            )}
            {feedback.explanationVideoUrl && (
              <a
                href={feedback.explanationVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-3"
              >
                <PlayCircle size={16} />
                Watch explanation video
              </a>
            )}
            {feedback.explanationVideoFile?.url && (
              <video
                controls
                src={feedback.explanationVideoFile.url}
                className="rounded-lg border border-blue-100 max-h-64 mt-3 w-full"
              />
            )}

            <button
              onClick={goNext}
              className="mt-4 w-full bg-linear-to-r from-blue-600 to-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium hover:shadow-md transition-all"
            >
              {index < questions.length - 1 ? 'Next Question' : 'Finish Chapter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}