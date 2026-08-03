import { z } from 'zod';

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
});
export type SubjectFormValues = z.infer<typeof subjectSchema>;

export const chapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.coerce.number().refine((v) => [9, 10, 11, 12].includes(v), {
    message: 'Grade must be 9, 10, 11, or 12',
  }),
  order: z.coerce.number().min(0).optional(),
});
export type ChapterFormValues = z.input<typeof chapterSchema>;

export const nationalExamSchema = z.object({
  year: z.coerce
    .number()
    .min(2000, 'Enter a valid year')
    .max(2100, 'Enter a valid year'),
  title: z.string().optional(),
});
export type NationalExamFormValues = z.input<typeof nationalExamSchema>;