import { z } from 'zod';

export const questionSchema = z.object({
  grade: z.coerce.number().refine((v) => [9, 10, 11, 12].includes(v), {
    message: 'Grade must be 9, 10, 11, or 12',
  }),
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().min(1, 'Chapter is required'),
  nationalExam: z.string().optional(),
  questionNumber: z.coerce.number().min(1, 'Question number must be at least 1'),
  questionText: z.string().min(1, 'Question text is required'),
  passage: z.string().optional(),
  choiceA: z.string().min(1, 'Choice A is required'),
  choiceB: z.string().min(1, 'Choice B is required'),
  choiceC: z.string().min(1, 'Choice C is required'),
  choiceD: z.string().min(1, 'Choice D is required'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], {
    message: 'Select the correct answer',
  }),
  explanation: z.string().optional(),
  explanationVideoUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'Must be a valid URL' }),
  status: z.enum(['draft', 'published']),
});

export type QuestionFormValues = z.input<typeof questionSchema>;