'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timer, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentQuizService } from '@/services/studentQuizService';
import type { QuizQuestion, BatchResultResponse } from '@/types/studentQuiz';

const EXAM_DURATION_SECONDS = 60 * 60; // 60 minutes flat for a combined exam

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FullExamPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const yearId = params.yearId as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BatchResultResponse | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentQuizService.getFullExamQuestions(subjectId, yearId);
      setQuestions(res.data);
    } catch {
      toast.error('Failed to load full exam questions');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, yearId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));
      const res = await studentQuizService.submitBatch(payload);
      setResult(res);
    } catch {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting]);

  useEffect(() => {
    if (isLoading || result) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, result, handleSubmitExam]);

  if (isLoading) {
    return <div className="text-center text-blue-400 text-sm py-10">Loading...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
        <p className="text-blue-400 text-sm">No questions found for this full exam.</p>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-linear-to-br from-blue-700 to-indigo-600 rounded-2xl p-6 text-white text-center mb-6">
          <p className="text-sm text-blue-100 mb-1">Your Score</p>
          <p className="text-4xl font-bold">{result.scorePercent}%</p>
          <p className="text-sm text-blue-100 mt-2">
            {result.correctCount} correct · {result.incorrectCount} incorrect · {result.totalAnswered} answered
          </p>
        </div>

        <div className="space-y-3">
          {result.results.map((r) => (
            <div key={r.questionId} className="bg-white rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-blue-400">
                  Grade {r.grade} · Q{r.questionNumber}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {r.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-950 mb-2">{r.questionText}</p>
              <p className="text-xs text-blue-500">
                Your answer: <span className="font-semibold">{r.yourAnswer}</span> · Correct answer:{' '}
                <span className="font-semibold text-emerald-700">{r.correctAnswer}</span>
              </p>
              {r.explanation && (
                <p className="text-xs text-blue-900/70 mt-2">{r.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(`/student/subjects/${subjectId}/years/${yearId}`)}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium mt-6 hover:shadow-md transition-all"
        >
          Back to Grades
        </button>
      </div>
    );
  }

  const current = questions[index];
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-blue-400">
            Grade {current.grade} · Question {index + 1} of {questions.length}
          </p>
          <p className="text-xs text-blue-400 mt-0.5">{answeredCount} answered</p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
            secondsLeft < 300 ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
          }`}
        >
          <Timer size={15} />
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="w-full h-1.5 bg-blue-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
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
            const isSelected = answers[current._id] === letter;
            return (
              <button
                key={letter}
                onClick={() => setAnswers((prev) => ({ ...prev, [current._id]: letter }))}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-100 text-blue-950'
                    : 'border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-950'
                }`}
              >
                <span className="font-semibold w-5 shrink-0">{letter}</span>
                <span className="flex-1">{current.choices[letter]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 text-blue-700 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {index < questions.length - 1 ? (
          <button
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-blue-600 to-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium hover:shadow-md transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-lg py-2.5 text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
          >
            <Flag size={16} />
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}