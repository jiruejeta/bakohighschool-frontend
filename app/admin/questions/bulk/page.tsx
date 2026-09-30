'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { subjectService } from '@/services/subjectService';
import { chapterService } from '@/services/chapterService';
import { nationalExamService } from '@/services/nationalExamService';
import { questionService } from '@/services/questionService';
import type { Subject, Chapter, NationalExam, ApiErrorResponse } from '@/types/academic';
import type { BulkQuestionInput } from '@/types/question';

const GRADES = [9, 10, 11, 12];

interface ParsedRow {
  row: number;
  valid: boolean;
  error?: string;
  data?: BulkQuestionInput;
}

function parseBulkText(text: string): ParsedRow[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 7) {
      return { row: idx + 1, valid: false, error: 'Expected at least 7 fields separated by |' };
    }
    const [qNum, qText, a, b, c, d, correct, explanation, passage] = parts;
    const correctUpper = correct.toUpperCase();

    if (!qNum || isNaN(Number(qNum))) {
      return { row: idx + 1, valid: false, error: 'Question number must be a number' };
    }
    if (!qText || !a || !b || !c || !d) {
      return { row: idx + 1, valid: false, error: 'Question text and all 4 choices are required' };
    }
    if (!['A', 'B', 'C', 'D'].includes(correctUpper)) {
      return { row: idx + 1, valid: false, error: 'Correct answer must be A, B, C, or D' };
    }

    return {
      row: idx + 1,
      valid: true,
      data: {
        questionNumber: Number(qNum),
        questionText: qText,
        choices: { A: a, B: b, C: c, D: d },
        correctAnswer: correctUpper as 'A' | 'B' | 'C' | 'D',
        explanation: explanation || '',
        passage: passage || '',
      },
    };
  });
}

export default function BulkQuestionUploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExam[]>([]);

  const [grade, setGrade] = useState(9);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [nationalExam, setNationalExam] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    }
  }, []);

  const loadNationalExams = useCallback(async () => {
    try {
      const res = await nationalExamService.getAll();
      setNationalExams(res.data);
    } catch {
      toast.error('Failed to load national exam years');
    }
  }, []);

  const loadChapters = useCallback(async () => {
    if (!subject || !grade) {
      setChapters([]);
      return;
    }
    try {
      const res = await chapterService.getAll({ subject, grade });
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    }
  }, [subject, grade]);

  useEffect(() => {
    loadSubjects();
    loadNationalExams();
  }, [loadSubjects, loadNationalExams]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  useEffect(() => {
    setParsed(rawText.trim() ? parseBulkText(rawText) : []);
  }, [rawText]);

  const validRows = parsed.filter((p) => p.valid);
  const invalidRows = parsed.filter((p) => !p.valid);

  const handleSubmit = async () => {
    if (!subject || !chapter) {
      toast.error('Select subject and chapter before submitting');
      return;
    }
    if (validRows.length === 0) {
      toast.error('No valid questions to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await questionService.bulkCreate({
        grade,
        subject,
        chapter,
        nationalExam: nationalExam || null,
        status,
        questions: validRows.map((r) => r.data!),
      });
      toast.success(res.message);
      if (res.failed.length === 0) {
        router.push('/admin/questions');
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Bulk upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bulk Upload Questions</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Paste multiple questions at once for one Grade + Subject + Chapter. Add images or
          videos afterward by editing each question individually.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Batch Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade</label>
            <select
              value={grade}
              onChange={(e) => {
                setGrade(Number(e.target.value));
                setChapter('');
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setChapter('');
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Chapter</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              disabled={!subject}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">{subject ? 'Select chapter' : 'Select a subject first'}</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              National Exam Year (optional)
            </label>
            <select
              value={nationalExam}
              onChange={(e) => setNationalExam(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">None</option>
              {nationalExams.map((ne) => (
                <option key={ne._id} value={ne._id}>
                  {ne.year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Paste Questions</h3>
        <p className="text-xs text-slate-500 mb-3">
          One question per line, fields separated by{' '}
          <code className="bg-slate-100 px-1 rounded">|</code>:
          <br />
          <code className="bg-slate-100 px-1 rounded text-[11px] block mt-1.5 whitespace-pre-wrap">
            QuestionNumber | Question Text | Choice A | Choice B | Choice C | Choice D |
            CorrectAnswer(A/B/C/D) | Explanation (optional) | Reading Passage (optional)
          </code>
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Example:{' '}
          <code className="bg-slate-100 px-1 rounded text-[11px]">
            1 | What is the powerhouse of the cell? | Nucleus | Mitochondria | Ribosome | Golgi
            apparatus | B | Mitochondria produce ATP. |
          </code>
        </p>
        <p className="text-xs text-slate-400 mb-3">
          The <span className="font-medium">Reading Passage</span> field is optional (9th field).
          For comprehension questions where several questions share the same passage, simply
          paste the <span className="font-medium">identical passage text</span> as the 9th field
          on every line that shares it — repetitive, but keeps the format simple and consistent.
          It will be shown above the question in the student app.
        </p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Paste your questions here, one per line..."
        />
      </div>

      {parsed.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Preview ({validRows.length} valid, {invalidRows.length} with errors)
          </h3>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {parsed.map((row) => (
              <div
                key={row.row}
                className={`flex items-start gap-2 text-xs p-2.5 rounded-lg ${
                  row.valid ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {row.valid ? (
                  <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium">Row {row.row}:</span>{' '}
                  {row.valid ? (
                    <span className="text-slate-700">
                      Q{row.data!.questionNumber} — {row.data!.questionText.slice(0, 60)}
                      {row.data!.questionText.length > 60 ? '...' : ''}
                    </span>
                  ) : (
                    <span className="text-red-700">{row.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/questions')}
          className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || validRows.length === 0}
          className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : `Upload ${validRows.length} Question(s)`}
        </button>
      </div>
    </div>
  );
}