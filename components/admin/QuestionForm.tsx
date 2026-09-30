'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { ImagePlus, Video, X } from 'lucide-react';
import { questionSchema, type QuestionFormValues } from '@/lib/validations/questionSchema';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { chapterService } from '@/services/chapterService';
import { nationalExamService } from '@/services/nationalExamService';
import type { Subject, Chapter, NationalExam, ApiErrorResponse } from '@/types/academic';
import type { Question } from '@/types/question';

const GRADES = [9, 10, 11, 12];

interface QuestionFormProps {
  initialData?: Question;
}

const getId = (val: { _id: string } | string | null | undefined) => {
  if (!val) return '';
  return typeof val === 'string' ? val : val._id;
};

export default function QuestionForm({ initialData }: QuestionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExam[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [explanationImageFile, setExplanationImageFile] = useState<File | null>(null);
  const [explanationVideoFile, setExplanationVideoFile] = useState<File | null>(null);

  const [removeQuestionImage, setRemoveQuestionImage] = useState(false);
  const [removeExplanationImage, setRemoveExplanationImage] = useState(false);
  const [removeExplanationVideoFile, setRemoveExplanationVideoFile] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData
      ? {
          grade: initialData.grade,
          subject: getId(initialData.subject),
          chapter: getId(initialData.chapter),
          nationalExam: getId(initialData.nationalExam) || '',
          questionNumber: initialData.questionNumber,
          questionText: initialData.questionText,
          passage: initialData?.passage || '',
          choiceA: initialData.choices.A,
          choiceB: initialData.choices.B,
          choiceC: initialData.choices.C,
          choiceD: initialData.choices.D,
          correctAnswer: initialData.correctAnswer,
          explanation: initialData.explanation || '',
          explanationVideoUrl: initialData.explanationVideoUrl || '',
          status: initialData.status,
        }
      : {
          grade: 9,
          subject: '',
          chapter: '',
          nationalExam: '',
          questionNumber: 1,
          questionText: '',
          passage: '',
          choiceA: '',
          choiceB: '',
          choiceC: '',
          choiceD: '',
          correctAnswer: 'A',
          explanation: '',
          explanationVideoUrl: '',
          status: 'draft',
        },
  });

  const selectedGrade = watch('grade');
  const selectedSubject = watch('subject');

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
    if (!selectedSubject || !selectedGrade) {
      setChapters([]);
      return;
    }
    try {
      const res = await chapterService.getAll({
        subject: selectedSubject,
        grade: Number(selectedGrade),
      });
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    }
  }, [selectedSubject, selectedGrade]);

  useEffect(() => {
    loadSubjects();
    loadNationalExams();
  }, [loadSubjects, loadNationalExams]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const onSubmit = async (values: QuestionFormValues) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('grade', String(values.grade));
      formData.append('subject', values.subject);
      formData.append('chapter', values.chapter);
      if (values.nationalExam) formData.append('nationalExam', values.nationalExam);
      formData.append('questionNumber', String(values.questionNumber));
      formData.append('questionText', values.questionText);
      if (values.passage) formData.append('passage', values.passage);
      formData.append('choices[A]', values.choiceA);
      formData.append('choices[B]', values.choiceB);
      formData.append('choices[C]', values.choiceC);
      formData.append('choices[D]', values.choiceD);
      formData.append('correctAnswer', values.correctAnswer);
      if (values.explanation) formData.append('explanation', values.explanation);
      if (values.explanationVideoUrl)
        formData.append('explanationVideoUrl', values.explanationVideoUrl);
      formData.append('status', values.status);

      if (questionImageFile) formData.append('questionImage', questionImageFile);
      if (explanationImageFile) formData.append('explanationImage', explanationImageFile);
      if (explanationVideoFile) formData.append('explanationVideoFile', explanationVideoFile);

      if (isEdit) {
        if (removeQuestionImage) formData.append('removeQuestionImage', 'true');
        if (removeExplanationImage) formData.append('removeExplanationImage', 'true');
        if (removeExplanationVideoFile) formData.append('removeExplanationVideoFile', 'true');
        await questionService.update(initialData!._id, formData);
        toast.success('Question updated');
      } else {
        await questionService.create(formData);
        toast.success('Question created');
      }

      router.push('/admin/questions');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Classification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade</label>
            <select
              {...register('grade')}
              onChange={(e) => {
                setValue('grade', Number(e.target.value) as never);
                setValue('chapter', '');
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
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
              {...register('subject')}
              onChange={(e) => {
                setValue('subject', e.target.value);
                setValue('chapter', '');
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1.5 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Chapter</label>
            <select
              {...register('chapter')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              disabled={!selectedSubject}
            >
              <option value="">{selectedSubject ? 'Select chapter' : 'Select a subject first'}</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.chapter && (
              <p className="mt-1.5 text-sm text-red-600">{errors.chapter.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              National Exam Year (optional)
            </label>
            <select
              {...register('nationalExam')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">None</option>
              {nationalExams.map((ne) => (
                <option key={ne._id} value={ne._id}>
                  {ne.title || `${ne.year} National Exam`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Question Number
            </label>
            <input
              type="number"
              {...register('questionNumber')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.questionNumber && (
              <p className="mt-1.5 text-sm text-red-600">{errors.questionNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Question</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reading Passage (optional)
          </label>
          <textarea
            {...register('passage')}
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Paste the reading passage here — shown above the question"
          />
          <p className="text-xs text-slate-400 mt-1">
            Use this for English comprehension questions. Leave blank if not needed.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Text</label>
          <textarea
            {...register('questionText')}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Enter the question"
          />
          {errors.questionText && (
            <p className="mt-1.5 text-sm text-red-600">{errors.questionText.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Question Image (optional)
          </label>
          {isEdit && initialData?.questionImage?.url && !removeQuestionImage && (
            <div className="mb-2 flex items-center gap-3">
              <img
                src={initialData.questionImage.url}
                alt=""
                className="h-16 rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => setRemoveQuestionImage(true)}
                className="text-xs text-red-600 flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 w-fit">
            <ImagePlus size={16} />
            {questionImageFile ? questionImageFile.name : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setQuestionImageFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Choices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['A', 'B', 'C', 'D'] as const).map((letter) => (
            <div key={letter}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Choice {letter}
              </label>
              <input
                {...register(`choice${letter}` as 'choiceA')}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Correct Answer
          </label>
          <div className="flex gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => (
              <label
                key={letter}
                className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer"
              >
                <input type="radio" value={letter} {...register('correctAnswer')} />
                {letter}
              </label>
            ))}
          </div>
          {errors.correctAnswer && (
            <p className="mt-1.5 text-sm text-red-600">{errors.correctAnswer.message}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Explanation</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Explanation Text (optional)
          </label>
          <textarea
            {...register('explanation')}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Explanation Image (optional)
          </label>
          {isEdit && initialData?.explanationImage?.url && !removeExplanationImage && (
            <div className="mb-2 flex items-center gap-3">
              <img
                src={initialData.explanationImage.url}
                alt=""
                className="h-16 rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => setRemoveExplanationImage(true)}
                className="text-xs text-red-600 flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 w-fit">
            <ImagePlus size={16} />
            {explanationImageFile ? explanationImageFile.name : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setExplanationImageFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Explanation Video Link (YouTube or other URL)
          </label>
          <input
            {...register('explanationVideoUrl')}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="https://youtube.com/watch?v=..."
          />
          {errors.explanationVideoUrl && (
            <p className="mt-1.5 text-sm text-red-600">{errors.explanationVideoUrl.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Or Upload Explanation Video File (optional)
          </label>
          {isEdit && initialData?.explanationVideoFile?.url && !removeExplanationVideoFile && (
            <div className="mb-2 flex items-center gap-3">
              <a
                href={initialData.explanationVideoFile.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-600 underline"
              >
                View current video
              </a>
              <button
                type="button"
                onClick={() => setRemoveExplanationVideoFile(true)}
                className="text-xs text-red-600 flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 w-fit">
            <Video size={16} />
            {explanationVideoFile ? explanationVideoFile.name : 'Upload video'}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setExplanationVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/questions')}
          className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : isEdit ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}