'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import QuestionForm from '@/components/admin/QuestionForm';
import { questionService } from '@/services/questionService';
import type { Question } from '@/types/question';

export default function EditQuestionPage() {
  const params = useParams();
  const id = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await questionService.getOne(id);
        setQuestion(res.data);
      } catch {
        toast.error('Failed to load question');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return <div className="text-center text-slate-400 text-sm py-10">Loading...</div>;
  }

  if (!question) {
    return <div className="text-center text-slate-400 text-sm py-10">Question not found.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Question</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Update question details, or add/replace image and video here.
        </p>
      </div>
      <QuestionForm initialData={question} />
    </div>
  );
}