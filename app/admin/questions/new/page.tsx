import QuestionForm from '@/components/admin/QuestionForm';

export default function NewQuestionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Question</h1>
        <p className="text-slate-500 mt-1 text-sm">Create a single question with full details.</p>
      </div>
      <QuestionForm />
    </div>
  );
}